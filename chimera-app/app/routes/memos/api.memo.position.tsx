import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, setMemoPosition } from '~/models/memo.server'
import type { Route } from './+types/api.memo.position'

async function requireAuthorizedMemo(request: Request, memoId: string) {
  const loginInfo = await isAuthenticated(request)
  const memo = await getMemo(memoId)
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { loginInfo, memo }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { loginInfo, memo: fromMemo } = await requireAuthorizedMemo(
    request,
    params.memoId,
  )

  const { toMemoId } = (await request.json()) as { toMemoId?: string }
  if (!toMemoId) {
    throw new Response('Bad Request.', { status: 400 })
  }

  const toMemo = await getMemo(toMemoId)
  if (toMemo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const updatedMemo = await setMemoPosition(fromMemo.id, toMemo.position)

  return Response.json({ memo: updatedMemo })
}
