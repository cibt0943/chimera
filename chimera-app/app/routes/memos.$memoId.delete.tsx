import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getSearchParams } from '~/lib/memo.server'
import { getMemo, deleteMemo } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.account_id !== loginSession.account.id) throw new Error('erorr')

    await deleteMemo(memo.id)

    return redirect(`/memos?${getSearchParams(request)}`)
  },
)
