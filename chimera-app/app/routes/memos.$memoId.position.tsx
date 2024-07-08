import { withAuthentication } from '~/lib/auth-middleware'
import { json } from '@remix-run/node'
import { getMemo, updateMemoPosition } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const fromMemo = await getMemo(params.memoId || '')
    if (!fromMemo || fromMemo.account_id !== account.id)
      throw new Error('erorr')

    const data = await request.json()
    const toMemoId = data.toMemoId
    const toMemo = await getMemo(toMemoId)
    if (!toMemo || toMemo.account_id !== account.id) throw new Error('erorr')

    const updatedMemo = await updateMemoPosition(fromMemo.id, toMemo.position)

    return json({ success: true, memo: updatedMemo })
  },
)
