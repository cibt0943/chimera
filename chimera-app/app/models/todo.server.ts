import { toDate } from 'date-fns'
import type { Database } from '~/types/database'
import { TodoType, Todo, Todos } from '~/types/todos'
import { supabase } from '~/lib/supabase-client.server'

// DBのTodoテーブルの型
export type TodoModel = Database['public']['Tables']['todos']['Row']
export type InsertTodoModel = Omit<
  Database['public']['Tables']['todos']['Insert'],
  'id'
> & { type: TodoType } // idを削除, typeを必須で上書き
export type UpdateTodoModel =
  Database['public']['Tables']['todos']['Update'] & { id: string } // idを必須で上書き

// Todo一覧を取得
export async function getTodos(accountId: string): Promise<Todos> {
  const { data, error } = await supabase
    .from('todos')
    .select()
    .eq('account_id', accountId)
    .order('position', { ascending: false })
  if (error) throw error

  return data.map(convertToTodo)
}

// Todoを取得
export async function getTodo(todoId: string): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .select()
    .eq('id', todoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return convertToTodo(data)
}

// Todoの追加
export async function addTodo(todo: InsertTodoModel): Promise<Todo> {
  // 現在の最大表示位置を取得
  const { data: maxTodo, error: errorMaxTodo } = await supabase
    .from('todos')
    .select('position')
    .eq('account_id', todo.account_id)
    .order('position', { ascending: false })
    .limit(1)
  if (errorMaxTodo) throw errorMaxTodo

  // 新しい表示位置を計算
  const newPosition = (maxTodo?.[0]?.position ?? 0) + 1

  // Todoを追加
  const { data: newTodo, error: errorNewTodo } = await supabase
    .from('todos')
    .insert({
      account_id: todo.account_id,
      type: todo.type,
      position: newPosition,
    })
    .select()
    .single()
  if (errorNewTodo || !newTodo) throw errorNewTodo || new Error('erorr')

  return getTodo(newTodo.id)
}

// Todoの更新
export async function updateTodo(todo: UpdateTodoModel): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(todo)
    .eq('id', todo.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return getTodo(data.id)
}

// Todoの削除
export async function deleteTodo(todoId: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', todoId)
  if (error) throw error
}

// TodoモデルをTodo型に変換
export function convertToTodo(todoModel: TodoModel): Todo {
  return {
    id: todoModel.id,
    createdAt: toDate(todoModel.created_at),
    updatedAt: toDate(todoModel.updated_at),
    accountId: todoModel.account_id,
    type: todoModel.type as TodoType,
    position: todoModel.position,
  }
}

// Todoの位置を変更
// 指定されたTodoの位置をpositionに変更します。
// この変更による他のTodoの位置の変更もあわせて行います。
export async function setTodoPosition(
  todoId: string,
  position: number,
): Promise<Todo> {
  const fromTodo = await getTodo(todoId)

  const isUp = fromTodo.position < position
  const [fromOperator, toOperator] = isUp ? ['gt', 'lte'] : ['lt', 'gte']

  const { data: todosToUpdate, error: errorTodosToUpdate } = await supabase
    .from('todos')
    .select()
    .filter('position', fromOperator, fromTodo.position)
    .filter('position', toOperator, position)
    .order('position')
  if (errorTodosToUpdate) throw errorTodosToUpdate

  // 間のTodoの位置を変更
  await updateTodosPosition(todosToUpdate, isUp)

  // 移動するタスクの位置を変更
  await updateTodoPosition(fromTodo.id, position)

  // 変更後のTodoを返す
  return getTodo(todoId)
}

// 複数のTodoの位置を更新
async function updateTodosPosition(
  todosToUpdate: TodoModel[],
  isUp: boolean,
): Promise<void> {
  const updatedTodos = todosToUpdate.map((todo) => ({
    ...todo,
    position: isUp ? todo.position - 1 : todo.position + 1,
  }))

  const { error } = await supabase
    .from('todos')
    .upsert(updatedTodos, { onConflict: 'id' })
  if (error) throw error
}

// Todoの位置を変更
async function updateTodoPosition(
  todoId: string,
  newPosition: number,
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({ position: newPosition })
    .eq('id', todoId)
  if (error) throw error
}
