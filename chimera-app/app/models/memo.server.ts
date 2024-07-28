import {
  Memos,
  Memo,
  MemoModel,
  MemoModel2Memo,
  MemoStatus,
} from '~/types/memos'
import { supabase } from '~/lib/supabase-client.server'

// メモ一覧を取得
export async function getMemos(
  accountId: string,
  statuses: MemoStatus[],
): Promise<Memos> {
  const { data, error } = await supabase
    .from('memos')
    .select()
    .eq('account_id', accountId)
    .in('status', statuses)
    .order('position', { ascending: false })
    .order('id')
  if (error) throw error

  const memos = data.map((memo) => {
    return MemoModel2Memo(memo)
  })

  return memos
}

// メモを取得
export async function getMemo(memoId: string): Promise<Memo> {
  const { data, error } = await supabase
    .from('memos')
    .select()
    .eq('id', memoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoModel2Memo(data)
}

// メモ情報の追加
interface insertMemoProps {
  account_id: string
  title: string
  content: string
  status: number
  related_date: string | null
}

export async function insertMemo(memo: insertMemoProps): Promise<Memo> {
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

  return MemoModel2Memo(newMemo)
}

// メモ情報の更新
interface updateMemoProps {
  id: string
  updated_at?: string
  position?: number
  title?: string
  content?: string
  status?: number
  related_date?: string | null
}

export async function updateMemo(
  memo: updateMemoProps,
  noUpdated = false,
): Promise<Memo> {
  if (!noUpdated) memo.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('memos')
    .update(memo)
    .eq('id', memo.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return MemoModel2Memo(data)
}

// メモ情報の削除
export async function deleteMemo(memoId: string): Promise<void> {
  const { error } = await supabase.from('memos').delete().eq('id', memoId)
  if (error) throw error
}

// メモの位置を変更
// memoIdにて指定されたメモの位置をpositionに変更します。
// この変更による他のメモの位置の変更もあわせて行います。
export async function updateMemoPosition(
  memoId: string,
  position: number,
): Promise<Memo> {
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
