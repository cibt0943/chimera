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
  const { data: maxPosition, error } = await supabase
    .from('tasks')
    .select('position', { count: 'exact' })
    .eq('user_id', task.user_id)
    .order('position', { ascending: false })
    .single()

  if (error) throw error

  const nextPosition = (maxPosition ? maxPosition.position : 0) + 1

  const { data: newTask } = await supabase
    .from('tasks')
    .insert({ ...task, position: nextPosition })
    .select()
    .single()

  if (!newTask) throw new Error('erorr')
  return newTask
}

interface updateTaskProps extends insertTaskProps {
  id: number
}

export async function updateTask(task: updateTaskProps): Promise<TaskModel> {
  const { data } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()

  if (!data) throw new Error('erorr')
  return data
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
  const from = isUp ? 'gt' : 'lt' // lt: より小さい, gt: より大きい
  const to = isUp ? 'lte' : 'gte' // lte: 以下, gte: 以上zx

  const { data: tasksToUpdate } = await supabase
    .from('tasks')
    .select('id, position, title, user_id')
    .filter('position', from, fromTask.position)
    .filter('position', to, position)
    .order('position')

  if (!tasksToUpdate) throw new Error('erorr')

  // 間のタスクの位置を変更
  const updatedTasks = tasksToUpdate.map((task) => ({
    ...task,
    position: isUp ? task.position - 1 : task.position + 1,
  }))

  const { error: updateError } = await supabase
    .from('tasks')
    .upsert(updatedTasks, { onConflict: 'id' })

  if (updateError) throw updateError

  // 移動するタスクの位置を変更
  const { data: updatedTask } = await supabase
    .from('tasks')
    .update({ position })
    .eq('id', fromTask.id)
    .select()
    .single()

  if (!updatedTask) throw new Error('Failed to update task position')

  return updatedTask
}
