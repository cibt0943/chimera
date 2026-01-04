import { supabase } from '~/lib/supabase-client.server'
import { addTodo, deleteTodo, TodoModel } from '~/models/todo.server'
import type { Database } from '~/types/schema'
import { TodoType } from '~/types/todos'
import { Task, TaskStatus } from '~/types/tasks'

// DBのタスクテーブルの型
export type TaskModel = Database['public']['Tables']['tasks']['Row']
export type InsertTaskModel = Database['public']['Tables']['tasks']['Insert']
export type UpdateTaskModel =
  Database['public']['Tables']['tasks']['Update'] & { id: string } // idを必須で上書き

// タスクの取得
export async function getTask(taskId: string): Promise<Task> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single()
  if (taskError || !taskData) throw taskError || new Error('erorr')

  // 関連するTodoを取得
  const { data: todoData, error: todoError } = await supabase
    .from('todos')
    .select()
    .eq('id', taskData.todo_id)
    .single()
  if (todoError || !todoData) throw todoError || new Error('erorr')

  return convertToTask(todoData, taskData)
}

// TodoIdからタスクを取得
export async function getTaskFromTodoId(todoId: string): Promise<Task> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select()
    .eq('todo_id', todoId)
    .single()
  if (taskError || !taskData) throw taskError || new Error('erorr')

  return getTask(taskData.id)
}

// タスクの追加
export async function addTask(task: InsertTaskModel): Promise<Task> {
  // まずはTodoを追加
  const newTodo = await addTodo({
    account_id: task.account_id,
    type: TodoType.TASK,
  })

  task.todo_id = newTodo.id

  // タスクを追加
  const { data: newTask, error: errorNewTask } = await supabase
    .from('tasks')
    .insert({ ...task })
    .select()
    .single()
  if (errorNewTask || !newTask) throw errorNewTask || new Error('erorr')

  return getTask(newTask.id)
}

// タスクの更新
export async function updateTask(
  task: UpdateTaskModel,
  noUpdated = false,
): Promise<Task> {
  if (!noUpdated) task.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return getTask(task.id)
}

// タスクの削除
export async function deleteTask(taskId: string): Promise<void> {
  const task = await getTask(taskId)
  deleteTaskFromTodoId(task.todoId)
}

// TodoIdからタスクの削除
export async function deleteTaskFromTodoId(todoId: string): Promise<void> {
  // まずはTodoを削除
  await deleteTodo(todoId)

  // タスクをTodoIdにて削除
  const { error } = await supabase.from('tasks').delete().eq('todo_id', todoId)
  if (error) throw error
}

// TodoModelとTaskModelからTaskに変換
function convertToTask(todoModel: TodoModel, taskModel: TaskModel): Task {
  return {
    id: taskModel.id,
    createdAt: new Date(taskModel.created_at),
    updatedAt: new Date(taskModel.updated_at),
    accountId: taskModel.account_id,
    todoId: todoModel.id,
    type: TodoType.TASK,
    position: todoModel.position,
    status: taskModel.status as TaskStatus,
    title: taskModel.title,
    memo: taskModel.memo,
    dueDate: taskModel.due_date ? new Date(taskModel.due_date) : null,
    dueDateAllDay: taskModel.due_date_all_day,
  }
}
