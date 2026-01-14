import { supabase } from '~/lib/supabase-client.server'
import { addTodo, deleteTodo, TodoModel } from '~/models/todo.server'
import type { Database } from '~/types/schema'
import { TodoType } from '~/types/todos'
import { TodoBar } from '~/types/todo-bars'

// DBのTodoBarテーブルの型
export type TodoBarModel = Database['public']['Tables']['todo_bars']['Row']
export type InsertTodoBarModel =
  Database['public']['Tables']['todo_bars']['Insert']
export type UpdateTodoBarModel =
  Database['public']['Tables']['todo_bars']['Update'] & { id: string } // idを必須で上書き

export type AddTodoBarModel = Omit<InsertTodoBarModel, 'todo_id'>

// TodoBarを取得
export async function getTodoBar(todoBarId: string): Promise<TodoBar> {
  const { data: todoBarData, error: todoBarError } = await supabase
    .from('todo_bars')
    .select()
    .eq('id', todoBarId)
    .single()
  if (todoBarError || !todoBarData) throw todoBarError || new Error('erorr')

  // 関連するTodoを取得
  const { data: todoData, error: todoError } = await supabase
    .from('todos')
    .select()
    .eq('id', todoBarData.todo_id)
    .single()
  if (todoError || !todoData) throw todoError || new Error('erorr')

  return convertToTodoBar(todoData, todoBarData)
}

// TodoIdからTodoBarを取得
export async function getTodoBarFromTodoId(todoId: string): Promise<TodoBar> {
  const { data: todoBarData, error: todoBarError } = await supabase
    .from('todo_bars')
    .select()
    .eq('todo_id', todoId)
    .single()
  if (todoBarError || !todoBarData) throw todoBarError || new Error('erorr')

  return getTodoBar(todoBarData.id)
}

// TodoBarの追加
export async function addTodoBar(todoBar: AddTodoBarModel): Promise<TodoBar> {
  // まずはTodoを追加
  const newTodo = await addTodo({
    account_id: todoBar.account_id,
    type: TodoType.BAR,
  })

  // TodoBarを追加
  const { data: newTodoBar, error: errorNewTodoBar } = await supabase
    .from('todo_bars')
    .insert({ ...todoBar, todo_id: newTodo.id })
    .select()
    .single()
  if (errorNewTodoBar || !newTodoBar)
    throw errorNewTodoBar || new Error('erorr')

  return getTodoBar(newTodoBar.id)
}

// TodoBarの更新
export async function updateTodoBar(
  todoBar: UpdateTodoBarModel,
  noUpdated = false,
): Promise<TodoBar> {
  if (!noUpdated) todoBar.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('todo_bars')
    .update(todoBar)
    .eq('id', todoBar.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return getTodoBar(data.id)
}

// TodoBarの削除
export async function deleteTodoBar(todoBarId: string): Promise<void> {
  const todoBar = await getTodoBar(todoBarId)
  await deleteTodoBarFromTodoId(todoBar.todoId)
}

// TodoIdからTodoBarの削除
export async function deleteTodoBarFromTodoId(todoId: string): Promise<void> {
  // まずはTodoを削除
  await deleteTodo(todoId)

  // TodoBarをTodoIdにて削除
  const { error } = await supabase
    .from('todo_bars')
    .delete()
    .eq('todo_id', todoId)
  if (error) throw error
}

// TodoModelとTodoBarModelからTodoBarに変換
function convertToTodoBar(
  todoModel: TodoModel,
  todoBarModel: TodoBarModel,
): TodoBar {
  return {
    id: todoBarModel.id,
    createdAt: new Date(todoBarModel.created_at),
    updatedAt: new Date(todoBarModel.updated_at),
    accountId: todoBarModel.account_id,
    todoId: todoModel.id,
    type: TodoType.BAR,
    position: todoModel.position,
    title: todoBarModel.title,
    color: todoBarModel.color,
  }
}
