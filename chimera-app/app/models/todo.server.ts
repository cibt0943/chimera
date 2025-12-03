import { format } from 'date-fns'
import { ViewTodo, ViewTodos, ViewTodoModel2ViewTodo } from '~/types/view-todos'
import {
  TodoType,
  Todo,
  InsertTodoModel,
  UpdateTodoModel,
  TodoModel2Todo,
} from '~/types/todos'
import { supabase } from '~/lib/supabase-client.server'

interface GetViewTodosOptionParams {
  dueDateStart?: Date
  dueDateEnd?: Date
}

// Todo一覧を取得
export async function getTodos(
  accountId: string,
  options?: GetViewTodosOptionParams,
): Promise<ViewTodos> {
  const { dueDateStart, dueDateEnd } = options || {}

  let query = supabase
    .from('view_todos')
    .select()
    .eq('account_id', accountId)
    .order('position', { ascending: false })

  if (dueDateStart) {
    query = query.gt('due_date', format(dueDateStart, 'yyyy-MM-dd'))
  }

  if (dueDateEnd) {
    query = query.lt('due_date', format(dueDateEnd, 'yyyy-MM-dd'))
  }

  const { data, error } = await query
  if (error) throw error

  const viewTodos = data.map((viewTodo) => {
    return ViewTodoModel2ViewTodo(viewTodo)
  })

  return viewTodos
}

// Todoを取得
export async function getTodo(todoId: string): Promise<ViewTodo> {
  const { data, error } = await supabase
    .from('view_todos')
    .select()
    .eq('id', todoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return ViewTodoModel2ViewTodo(data)
}

// Todoの追加
export async function addTodo(todo: InsertTodoModel): Promise<Todo> {
  // 現在の最大表示位置を取得
  const { data: maxTodo, error: errorMaxTodo } = await supabase
    .from('todos')
    .select()
    .eq('account_id', todo.account_id)
    .order('position', { ascending: false })
    .limit(1)
  if (errorMaxTodo) throw errorMaxTodo

  // 新しい表示位置を計算
  const newPosition = maxTodo.length > 0 ? maxTodo[0].position + 1 : 1

  // Todoを追加
  const { data: newTodo, error: errorNewTodo } = await supabase
    .from('todos')
    .insert({
      account_id: todo.account_id,
      type: TodoType.TASK,
      position: newPosition,
    })
    .select()
    .single()
  if (errorNewTodo || !newTodo) throw errorNewTodo || new Error('erorr')

  return TodoModel2Todo(newTodo)
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

  return TodoModel2Todo(data)
}

// Todoの削除
export async function deleteTodo(todoId: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', todoId)
  if (error) throw error
}

// Todoの位置を変更
export async function updateTodoPosition(
  todoId: string,
  newPosition: number,
): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .update({ position: newPosition })
    .eq('id', todoId)
  if (error) throw error
}
