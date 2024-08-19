import { withAuthentication } from '~/lib/auth-middleware'
import { json } from '@remix-run/node'
import { getMemo, updateMemoPosition } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const fromMemo = await getMemo(params.memoId || '')
    if (fromMemo.accountId !== loginSession.account.id) throw new Error('erorr')

    const data = await request.json()
    const toMemo = await getMemo(data.toMemoId)
    if (toMemo.accountId !== loginSession.account.id) throw new Error('erorr')

    const updatedMemo = await updateMemoPosition(fromMemo.id, toMemo.position)

    return json({ memo: updatedMemo })
  },
)
