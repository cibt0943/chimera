import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getMemo, deleteMemo } from '~/models/memo.server'

export const action = withAuthentication(async ({ params, account }) => {
  const memo = await getMemo(params.memoId || '')
  if (memo.account_id !== account.id) throw new Error('erorr')

  await deleteMemo(memo.id)

  return redirect('/memos')
})
