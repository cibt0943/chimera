import { format, toDate } from 'date-fns'
import {
  supabase,
  createSupabaseClientForUser,
} from '~/lib/supabase-client.server'
import { addTodo, deleteTodo, TodoModel } from '~/models/todo.server'
import type { Database } from '~/types/database'
import { TodoType } from '~/types/todos'
import { Task, TaskStatus } from '~/types/tasks'

// DBのタスクテーブルの型
export type TaskModel = Database['public']['Tables']['tasks']['Row']
export type InsertTaskModel = Database['public']['Tables']['tasks']['Insert']
export type UpdateTaskModel =
  Database['public']['Tables']['tasks']['Update'] & { id: string } // idを必須で上書き

export type AddTaskModel = Omit<InsertTaskModel, 'todo_id'>

type TaskJoinTodoModel = TaskModel & { todos: TodoModel | null }

const TASK_WITH_TODO_SELECT = '*, todos!tasks_todo_id_fkey!inner(*)'

interface GetTodosOptionParams {
  dueDateStart?: Date
  dueDateEnd?: Date
}

// タスク一覧の取得
export async function getTasks(
  accountId: string,
  options?: GetTodosOptionParams,
): Promise<Task[]> {
  const { dueDateStart, dueDateEnd } = options ?? {}
  const client = createSupabaseClientForUser(accountId)

  let query = client
    .from('tasks')
    .select(TASK_WITH_TODO_SELECT)
    .eq('account_id', accountId)
    .order('position', { ascending: false, referencedTable: 'todos' })

  if (dueDateStart) {
    query = query.gt('due_date', format(dueDateStart, 'yyyy-MM-dd'))
  }

  if (dueDateEnd) {
    query = query.lt('due_date', format(dueDateEnd, 'yyyy-MM-dd'))
  }

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as TaskJoinTodoModel[]

  return rows.map((row) => {
    const { todos: todoModel, ...taskModel } = row
    if (!todoModel) throw new Error('todo not found')
    return convertToTask(todoModel, taskModel as TaskModel)
  })
}

// タスクの取得
export async function getTask(taskId: string): Promise<Task> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select(TASK_WITH_TODO_SELECT)
    .eq('id', taskId)
    .single()
  if (taskError || !taskData) throw taskError || new Error('erorr')

  const { todos: todoModel, ...taskModel } = taskData as TaskJoinTodoModel
  if (!todoModel) throw new Error('todo not found')

  return convertToTask(todoModel, taskModel as TaskModel)
}

// TodoIdからタスクを取得
export async function getTaskFromTodoId(todoId: string): Promise<Task> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('todo_id', todoId)
    .single()
  if (taskError || !taskData) throw taskError || new Error('erorr')

  return getTask(taskData.id)
}

// タスクの追加
export async function addTask(task: AddTaskModel): Promise<Task> {
  // まずはTodoを追加
  const newTodo = await addTodo({
    account_id: task.account_id,
    type: TodoType.TASK,
  })

  // タスクを追加
  const client = createSupabaseClientForUser(task.account_id)
  const { data: newTask, error: errorNewTask } = await client
    .from('tasks')
    .insert({ ...task, todo_id: newTodo.id })
    .select('id')
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
    .select('id')
    .single()
  if (error || !data) throw error || new Error('erorr')

  return getTask(task.id)
}

// タスクの削除
export async function deleteTask(taskId: string): Promise<void> {
  const task = await getTask(taskId)
  await deleteTaskFromTodoId(task.todoId)
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
    createdAt: toDate(taskModel.created_at),
    updatedAt: toDate(taskModel.updated_at),
    accountId: taskModel.account_id,
    todoId: todoModel.id,
    type: TodoType.TASK,
    position: todoModel.position,
    status: taskModel.status as TaskStatus,
    title: taskModel.title,
    memo: taskModel.memo,
    dueDate: taskModel.due_date ? toDate(taskModel.due_date) : null,
    dueDateAllDay: taskModel.due_date_all_day,
  }
}
