import { MemoModel, MemoModels } from '~/types/memos'
import { supabase } from '~/lib/supabase-client.server'

// メモ一覧を取得
export async function getMemos(account_id: number): Promise<MemoModels> {
  const { data, error } = await supabase
    .from('memos')
    .select()
    .eq('account_id', account_id)
    .order('position', { ascending: false })
    .order('id')
  if (error) throw error

  return data || []
}

// メモを取得
export async function getMemo(memoId: number): Promise<MemoModel> {
  const { data, error } = await supabase
    .from('memos')
    .select()
    .eq('id', memoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

// メモ情報の追加
interface insertMemoProps {
  title: string
  content: string
  related_date: string | null
  account_id: number
}

export async function insertMemo(memo: insertMemoProps): Promise<MemoModel> {
  const { data: maxMemo, error: errorMaxMemo } = await supabase
    .from('memos')
    .select()
    .eq('account_id', memo.account_id)
    .order('position', { ascending: false })
    .limit(1)
  if (errorMaxMemo) throw errorMaxMemo

  const position = maxMemo.length > 0 ? maxMemo[0].position + 1 : 1

  const { data: newMemo, error: errorNewMemo } = await supabase
    .from('memos')
    .insert({ ...memo, position })
    .select()
    .single()
  if (errorNewMemo || !newMemo) throw errorNewMemo || new Error('erorr')

  return newMemo
}

// メモ情報の更新
interface updateMemoProps {
  id: number
  title?: string
  content?: string
  related_date?: string | null
  position?: number
  account_id?: number
  updated_at?: string
}

export async function updateMemo(
  memo: updateMemoProps,
  noUpdated = false,
): Promise<MemoModel> {
  if (!noUpdated) {
    memo.updated_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('memos')
    .update(memo)
    .eq('id', memo.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

// メモ情報の削除
export async function deleteMemo(memoId: number): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', memoId)
  if (error) throw error
}

// メモの位置を変更
// memoIdにて指定されたメモの位置をpositionに変更します。
// この変更による他のメモの位置の変更もあわせて行います。
export async function updateMemoPosition(
  memoId: number,
  position: number,
): Promise<MemoModel> {
  const fromMemo = await getMemo(memoId)

  const isUp = fromMemo.position < position
  const [fromOperator, toOperator] = isUp ? ['gt', 'lte'] : ['lt', 'gte']

  const { data: memosToUpdate, error: errorMemosToUpdate } = await supabase
    .from('memos')
    .select()
    .filter('position', fromOperator, fromMemo.position)
    .filter('position', toOperator, position)
    .order('position')
  if (errorMemosToUpdate) throw errorMemosToUpdate

  // 間のメモの位置を変更
  await updateMemosPosition(memosToUpdate, isUp)
  // 移動するメモの位置を変更
  return await updateMemo({
    id: fromMemo.id,
    position,
  })
}

async function updateMemosPosition(memosToUpdate: MemoModel[], isUp: boolean) {
  const updatedMemos = memosToUpdate.map((memo) => ({
    ...memo,
    position: isUp ? memo.position - 1 : memo.position + 1,
  }))

  const { error } = await supabase
    .from('memos')
    .upsert(updatedMemos, { onConflict: 'id' })
  if (error) throw error
}
