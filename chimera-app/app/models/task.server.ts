import { TaskModel, TaskModels } from '~/types/tasks'
import { supabase } from '~/lib/supabaseClient.server'

// タスク一覧を取得
export async function getTasks(user_id: number): Promise<TaskModels> {
  const { data } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', user_id)
    .order('position', { ascending: false })
    .order('id')
  return data || []
}

// タスクを取得
export async function getTask(taskId: number): Promise<TaskModel> {
  const { data } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single()

  if (!data) throw new Error('erorr')
  return data
}

// タスク情報の追加
interface insertTaskProps {
  title: string
  memo: string
  status: number
  due_date: string | null
  user_id: number
}

export async function insertTask(task: insertTaskProps): Promise<TaskModel> {
  const { data: maxTask, error } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', task.user_id)
    .order('position', { ascending: false })
    .limit(1)

  if (error) throw error

  const position = maxTask ? maxTask[0].position + 1 : 1

  const { data: newTask } = await supabase
    .from('tasks')
    .insert({ ...task, position })
    .select()
    .single()

  if (!newTask) throw new Error('erorr')
  return newTask
}

interface updateTaskProps {
  id: number
  position?: number
  title?: string
  memo?: string
  status?: number
  due_date?: string | null
  user_id?: number
  updated_at?: string
}

export async function updateTask(task: updateTaskProps): Promise<TaskModel> {
  const { data: updateTask } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()

  if (!updateTask) throw new Error('erorr')
  return updateTask
}

export async function deleteTask(taskId: number): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error('erorr')
}

// タスクの位置を変更
// taskIdにて指定されたタスクの位置をpositionに変更します。
// この変更による他のタスクの位置の変更もあわせて行います。
export async function changeTaskPosition(
  taskId: number,
  position: number,
): Promise<TaskModel> {
  const fromTask = await getTask(taskId)

  const isUp = fromTask.position < position
  const [fromOperator, toOperator] = isUp ? ['gt', 'lte'] : ['lt', 'gte']

  const { data: tasksToUpdate, error } = await supabase
    .from('tasks')
    .select()
    .filter('position', fromOperator, fromTask.position)
    .filter('position', toOperator, position)
    .order('position')

  if (error) throw error

  // 間のタスクの位置を変更
  await updateTasksPosition(tasksToUpdate, isUp)
  // 移動するタスクの位置を変更
  return await updateTask({
    id: fromTask.id,
    position,
    updated_at: new Date().toISOString(),
  })
}

async function updateTasksPosition(tasksToUpdate: TaskModel[], isUp: boolean) {
  const updatedTasks = tasksToUpdate.map((task) => ({
    ...task,
    position: isUp ? task.position - 1 : task.position + 1,
  }))

  const { error: updateError } = await supabase
    .from('tasks')
    .upsert(updatedTasks, { onConflict: 'id' })

  if (updateError) throw updateError
}
