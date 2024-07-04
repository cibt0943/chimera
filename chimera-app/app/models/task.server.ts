import { TaskModel, TaskModels } from '~/types/tasks'
import { supabase } from '~/lib/supabase-client.server'

// タスク一覧を取得
export async function getTasks(account_id: string): Promise<TaskModels> {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('account_id', account_id)
    .order('position', { ascending: false })
    .order('id')
  if (error) throw error

  return data || []
}

// タスクを取得
export async function getTask(taskId: string): Promise<TaskModel> {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

// タスク情報の追加
interface insertTaskProps {
  title: string
  memo: string
  status: number
  due_date: string | null
  account_id: string
}

export async function insertTask(task: insertTaskProps): Promise<TaskModel> {
  const { data: maxTask, error: errorMaxTask } = await supabase
    .from('tasks')
    .select()
    .eq('account_id', task.account_id)
    .order('position', { ascending: false })
    .limit(1)
  if (errorMaxTask) throw errorMaxTask

  const position = maxTask.length > 0 ? maxTask[0].position + 1 : 1

  const { data: newTask, error: errorNewTask } = await supabase
    .from('tasks')
    .insert({ ...task, position })
    .select()
    .single()
  if (errorNewTask || !newTask) throw errorNewTask || new Error('erorr')

  return newTask
}

// タスク情報の追加
interface updateTaskProps {
  id: string
  position?: number
  title?: string
  memo?: string
  status?: number
  due_date?: string | null
  account_id?: string
  updated_at?: string
}

export async function updateTask(
  task: updateTaskProps,
  noUpdated = false,
): Promise<TaskModel> {
  if (!noUpdated) {
    task.updated_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

// タスクの位置を変更
// taskIdにて指定されたタスクの位置をpositionに変更します。
// この変更による他のタスクの位置の変更もあわせて行います。
export async function updateTaskPosition(
  taskId: string,
  position: number,
): Promise<TaskModel> {
  const fromTask = await getTask(taskId)

  const isUp = fromTask.position < position
  const [fromOperator, toOperator] = isUp ? ['gt', 'lte'] : ['lt', 'gte']

  const { data: tasksToUpdate, error: errorTasksToUpdate } = await supabase
    .from('tasks')
    .select()
    .filter('position', fromOperator, fromTask.position)
    .filter('position', toOperator, position)
    .order('position')
  if (errorTasksToUpdate) throw errorTasksToUpdate

  // 間のタスクの位置を変更
  await updateTasksPosition(tasksToUpdate, isUp)
  // 移動するタスクの位置を変更
  return await updateTask({
    id: fromTask.id,
    position,
  })
}

async function updateTasksPosition(tasksToUpdate: TaskModel[], isUp: boolean) {
  const updatedTasks = tasksToUpdate.map((task) => ({
    ...task,
    position: isUp ? task.position - 1 : task.position + 1,
  }))

  const { error } = await supabase
    .from('tasks')
    .upsert(updatedTasks, { onConflict: 'id' })
  if (error) throw error
}
