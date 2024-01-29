import { TaskModel, TaskModels } from '~/types/tasks'
import { supabase } from '~/lib/supabaseClient.server'

// タスク一覧を取得
export async function getTasks(user_id: number): Promise<TaskModels> {
  const { data } = await supabase.from('tasks').select().eq('user_id', user_id)
  return data || []
}

// タスク情報の追加
export async function insertTask(task: TaskModel): Promise<TaskModel> {
  const { data } = await supabase.from('tasks').insert(task).select().single()
  if (!data) throw new Error('erorr')
  return data
}
