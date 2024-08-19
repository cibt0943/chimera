import { jsonWithSuccess } from 'remix-toast'
import * as zod from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { MemoStatus, UpdateMemoModel } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, {
      schema: zod.object({
        status: zod
          .preprocess((v) => Number(v), zod.nativeEnum(MemoStatus))
          .optional(),
        relatedDate: zod.date().optional(),
        relatedDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
      }),
    })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
    }

    const data = submission.value

    let toastMsg = ''
    const values: UpdateMemoModel = { id: memo.id }
    if (data.status !== undefined) {
      values.status = data.status
      toastMsg =
        data.status === MemoStatus.ARCHIVED
          ? 'memo.message.archived'
          : 'memo.message.un_archived'
    }
    if (data.relatedDate !== undefined) {
      values.related_date = data.relatedDate?.toISOString() || null
      values.related_date_all_day = !!data.relatedDateAllDay
    }

    const updatedMemo = await updateMemo(values)

    return jsonWithSuccess({ memo: updatedMemo }, toastMsg)
  },
)
