import { format } from 'date-fns'
import {
  Task,
  Tasks,
  InsertTaskModel,
  UpdateTaskModel,
  ViewTodo2Task,
} from '~/types/tasks'
import { TodoType } from '~/types/todos'
import { ViewTodoModel, ViewTodoModel2ViewTodo } from '~/types/view-todos'
import { supabase } from '~/lib/supabase-client.server'
import { addTodo, getTodo, updateTodoPosition } from '~/models/todo.server'

// タスクの取得
export async function getTask(todoId: string): Promise<Task> {
  const viewTodo = await getTodo(todoId)
  return ViewTodo2Task(viewTodo)
}

interface GetTasksOptionParams {
  dueDateStart?: Date
  dueDateEnd?: Date
}

// タスク一覧を取得
export async function getTasks(
  accountId: string,
  options?: GetTasksOptionParams,
): Promise<Tasks> {
  const { dueDateStart, dueDateEnd } = options || {}

  let query = supabase
    .from('view_todos')
    .select()
    .eq('account_id', accountId)
    .eq('type', TodoType.TASK)
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
    return ViewTodo2Task(ViewTodoModel2ViewTodo(viewTodo as ViewTodoModel))
  })

  return viewTodos
}

// タスクの追加
export async function addTask(task: InsertTaskModel): Promise<Task> {
  const newTodo = await addTodo({
    account_id: task.account_id,
    type: TodoType.TASK,
  })

  // タスクの追加
  const { data: newTask, error: errorNewTask } = await supabase
    .from('tasks')
    .insert({ ...task, todo_id: newTodo.id })
    .select()
    .single()
  if (errorNewTask || !newTask)
    throw errorNewTask || new Error('Failed to insert task')

  // 追加されたタスクを取得して返す
  return await getTask(newTodo.id)
}

// 後方互換性のためのエイリアス
export const insertTask = addTask

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
  if (error || !data) throw error || new Error('Failed to update task')

  // 更新されたタスクをview_todosから取得して返す
  return await getTask(data.todo_id)
}

// タスクの削除
export async function deleteTask(taskId: string): Promise<void> {
  // まずtodo_idを取得
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('todo_id')
    .eq('id', taskId)
    .single()
  if (taskError) throw taskError

  // タスクを削除
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error

  // 対応するtodoも削除
  const { error: todoError } = await supabase
    .from('todos')
    .delete()
    .eq('id', taskData.todo_id)
  if (todoError) throw todoError
}

// タスクの位置を変更
// taskIdにて指定されたタスクの位置をpositionに変更します。
// この変更による他のタスクの位置の変更もあわせて行います。
export async function updateTaskPosition(
  taskId: string,
  position: number,
): Promise<Task> {
  const fromTask = await getTask(taskId)

  // todosテーブルのpositionを更新
  await updateTodoPosition(fromTask.todoId, position)

  return await getTask(fromTask.todoId)
}
