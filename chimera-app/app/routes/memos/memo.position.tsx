import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, updateMemoPosition } from '~/models/memo.server'
import type { Route } from './+types/memo.position'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const fromMemo = await getMemo(params.memoId || '')
  if (fromMemo.accountId !== loginInfo.account.id) throw new Error('erorr')

  const data = await request.json()
  const toMemo = await getMemo(data.toMemoId)
  if (toMemo.accountId !== loginInfo.account.id) throw new Error('erorr')

  const updatedMemo = await updateMemoPosition(fromMemo.id, toMemo.position)

  return { memo: updatedMemo }
}
