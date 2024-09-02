import {
  MemoSettings,
  UpdateMemoSettingsModel,
  MemoSettingsModel2MemoSettings,
} from '~/types/memo-settings'
import { supabase } from '~/lib/supabase-client.server'

// アカウントのメモ設定情報を取得
export async function getMemoSettings(
  accountId: string,
): Promise<MemoSettings> {
  const { data, error } = await supabase
    .from('memo_settings')
    .select()
    .eq('account_id', accountId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の取得、なければ追加
export async function getOrInsertMemoSettings(
  accountId: string,
): Promise<MemoSettings> {
  try {
    const memoSettings = await getMemoSettings(accountId)
    if (memoSettings) return memoSettings
  } catch (error) {
    //accountIdが空以外は握りつぶす
    if (accountId === '') throw error
  }

  const { data, error } = await supabase
    .from('memo_settings')
    .insert({ account_id: accountId })
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の更新
export async function updateMemoSettings(
  memoSettings: UpdateMemoSettingsModel,
  noUpdated = false,
): Promise<MemoSettings> {
  if (!noUpdated) memoSettings.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('memo_settings')
    .update(memoSettings)
    .eq('id', memoSettings.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoSettingsModel2MemoSettings(data)
}

// アカウントのメモ設定情報の削除
export async function deleteMemoSettings(accountId: string): Promise<void> {
  const { error } = await supabase
    .from('memo_settings')
    .delete()
    .eq('account_id', accountId)
  if (error) throw error
}
