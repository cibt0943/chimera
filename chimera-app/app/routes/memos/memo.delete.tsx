import { redirect } from 'react-router'
import { MEMO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, deleteMemo } from '~/models/memo.server'
import type { Route } from './+types/memo.delete'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const memo = await getMemo(params.memoId || '')
  if (memo.accountId !== loginInfo.account.id) throw new Error('erorr')

  await deleteMemo(memo.id)

  const formData = await request.formData()
  const returnUrl = formData.get('returnUrl') as string | null
  return redirect(returnUrl || MEMO_URL)
}
