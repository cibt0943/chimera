import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, updateMemoPosition } from '~/models/memo.server'
import type { Route } from './+types/api.memo.position'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const fromMemo = await getMemo(params.memoId || '')
  if (fromMemo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const data = await request.json()
  const toMemo = await getMemo(data.toMemoId)
  if (toMemo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const updatedMemo = await updateMemoPosition(fromMemo.id, toMemo.position)

  return Response.json({ memo: updatedMemo })
}
