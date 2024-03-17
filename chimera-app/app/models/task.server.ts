import { TaskModel, TaskModels } from '~/types/tasks'
import { supabase } from '~/lib/supabaseClient.server'

// タスク一覧を取得
export async function getTasks(user_id: number): Promise<TaskModels> {
  const { data } = await supabase.from('tasks').select().eq('user_id', user_id)
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
  const { data } = await supabase.from('tasks').insert(task).select().single()
  if (!data) throw new Error('erorr')
  return data
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
