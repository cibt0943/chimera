import {
  MemoSettings,
  MemoSettingsModel2MemoSettings,
} from '~/types/memo-settings'
import { MemoStatus } from '~/types/memos'
import { supabase } from '~/lib/supabase-client.server'

// アカウントのメモ設定情報を取得
export async function getMemoSettings(
  account_id: string,
): Promise<MemoSettings> {
  const { data, error } = await supabase
    .from('memo_settings')
    .select()
    .eq('account_id', account_id)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の取得、なければ追加
export async function getOrInsertMemoSettings(
  account_id: string,
): Promise<MemoSettings> {
  try {
    const memoSettings = await getMemoSettings(account_id)
    if (memoSettings) return memoSettings
  } catch (error) {
    console.log('error', error)
  }

  const { data, error } = await supabase
    .from('memo_settings')
    .insert({ account_id: account_id })
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の更新
interface updateMemoSettingsProps {
  id: string
  updated_at?: string
  list_filter?: {
    statuses: MemoStatus[]
  }
  list_display?: {
    content: boolean
  }
  auto_save?: boolean
}

export async function updateMemoSettings(
  MemoSettings: updateMemoSettingsProps,
  noUpdated = false,
): Promise<MemoSettings> {
  if (!noUpdated) MemoSettings.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('memo_settings')
    .update(MemoSettings)
    .eq('id', MemoSettings.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の削除
export async function deleteMemoSettings(account_id: string): Promise<void> {
  const { error } = await supabase
    .from('memo_settings')
    .delete()
    .eq('account_id', account_id)
  if (error) throw error
}
