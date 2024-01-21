import { TaskModel } from '~/types/tasks'
import { supabase } from '~/lib/supabaseClient.server'

// タスク一覧を取得
export async function getTasks(user_id: number): Promise<TaskModel[]> {
  const { data } = await supabase.from('tasks').select().eq('user_id', user_id)
  return data || []
}

// タスク情報の追加
export async function insertTask(user: TaskModel): Promise<TaskModel> {
  const { data } = await supabase.from('tasks').insert(user).select().single()
  return data
}
