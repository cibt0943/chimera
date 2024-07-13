import * as zod from 'zod'
import { redirect } from '@remix-run/node'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { getSearchParams } from '~/lib/memo'
import { MemoStatus } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.account_id !== account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, {
      schema: zod.object({
        status: zod.preprocess((v) => Number(v), zod.nativeEnum(MemoStatus)),
      }),
    })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
    }

    const data = submission.value

    await updateMemo({
      id: memo.id,
      status: data.status,
    })

    return redirect(`/memos?${getSearchParams(request)}`)
  },
)
