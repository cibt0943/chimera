import { format } from 'date-fns'
import {
  Memos,
  Memo,
  MemoModel,
  InsertMemoModel,
  UpdateMemoModel,
  MemoModel2Memo,
  MemoStatus,
} from '~/types/memos'
import { supabase } from '~/lib/supabase-client.server'

// メモ一覧を取得
interface GetMemosOptionParams {
  statuses?: MemoStatus[]
  relatedDateStart?: Date
  relatedDateEnd?: Date
}
export async function getMemos(
  accountId: string,
  options?: GetMemosOptionParams,
): Promise<Memos> {
  const { statuses, relatedDateStart, relatedDateEnd } = options || {}

  let query = supabase
    .from('memos')
    .select()
    .eq('account_id', accountId)
    .order('position', { ascending: false })
    .order('id')

  if (statuses) {
    query = query.in('status', statuses)
  }

  if (relatedDateStart) {
    query = query.gt('related_date', format(relatedDateStart, 'yyyy-MM-dd'))
  }

  if (relatedDateEnd) {
    query = query.lt('related_date', format(relatedDateEnd, 'yyyy-MM-dd'))
  }

  const { data, error } = await query
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

// メモの追加
export async function insertMemo(memo: InsertMemoModel): Promise<Memo> {
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

// メモの更新
export async function updateMemo(
  memo: UpdateMemoModel,
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

// メモの削除
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
