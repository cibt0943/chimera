import {
  Todos,
  Todo,
  TodoModel,
  InsertTodoModel,
  UpdateTodoModel,
  TodoModel2Todo,
} from '~/types/todos'
import { supabase } from '~/lib/supabase-client.server'

// Todo一覧を取得
export async function getTodos(accountId: string): Promise<Todos> {
  const query = supabase
    .from('todos')
    .select()
    .eq('account_id', accountId)
    .order('position', { ascending: false })

  const { data, error } = await query
  if (error) throw error

  const todos = data.map((todo) => {
    return TodoModel2Todo(todo)
  })

  return todos
}

// Todoを取得
export async function getTodo(todoId: string): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .select()
    .eq('id', todoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return TodoModel2Todo(data)
}

// Todoの追加
export async function insertTodo(todo: InsertTodoModel): Promise<Todo> {
  const { data: maxTodo, error: errorMaxTodo } = await supabase
    .from('todos')
    .select()
    .eq('account_id', todo.account_id)
    .order('position', { ascending: false })
    .limit(1)
  if (errorMaxTodo) throw errorMaxTodo

  const position = maxTodo.length > 0 ? maxTodo[0].position + 1 : 1

  const { data: newTodo, error: errorNewTodo } = await supabase
    .from('todos')
    .insert({ ...todo, position })
    .select()
    .single()
  if (errorNewTodo || !newTodo) throw errorNewTodo || new Error('erorr')

  return TodoModel2Todo(newTodo)
}

// Todoの更新
export async function updateTodo(
  todo: UpdateTodoModel,
  noUpdated = false,
): Promise<Todo> {
  if (!noUpdated) todo.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('todos')
    .update(todo)
    .eq('id', todo.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return TodoModel2Todo(data)
}

// Todoの削除
export async function deleteTodo(todoId: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', todoId)
  if (error) throw error
}

// Todoの位置を変更
// todoIdにて指定されたTodoの位置をpositionに変更します。
// この変更による他のTodoの位置の変更もあわせて行います。
export async function updateTodoPosition(
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
  // 移動するTodoの位置を変更
  return await updateTodo({
    id: fromTodo.id,
    position,
  })
}

async function updateTodosPosition(todosToUpdate: TodoModel[], isUp: boolean) {
  const updatedTodos = todosToUpdate.map((todo) => ({
    ...todo,
    position: isUp ? todo.position - 1 : todo.position + 1,
  }))

  const { error } = await supabase
    .from('todos')
    .upsert(updatedTodos, { onConflict: 'id' })
  if (error) throw error
}
