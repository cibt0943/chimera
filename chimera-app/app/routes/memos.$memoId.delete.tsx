import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getMemo, deleteMemo } from '~/models/memo.server'

export const action = withAuthentication(async ({ params, loginSession }) => {
  const memo = await getMemo(params.memoId || '')
  if (memo.account_id !== loginSession.account.id) throw new Error('erorr')

  await deleteMemo(memo.id)

  return redirect(`/memos`)
})
