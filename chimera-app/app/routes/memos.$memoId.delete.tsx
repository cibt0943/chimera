import { redirect } from '@remix-run/node'
import { MEMO_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { getMemo, deleteMemo } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.accountId !== loginSession.account.id) throw new Error('erorr')

    await deleteMemo(memo.id)

    const formData = await request.formData()
    const returnUrl = formData.get('returnUrl') as string | null
    return redirect(returnUrl || MEMO_URL)
  },
)
