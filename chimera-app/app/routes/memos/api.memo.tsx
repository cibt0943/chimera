import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { MemoStatus, UpdateMemoModel } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'
import type { Route } from './+types/api.memo'

// メモの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const memo = await getMemo(params.memoId || '')
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const jsonData = await request.json()

  const scheme = zod.object({
    status: zod
      .preprocess((v) => Number(v), zod.nativeEnum(MemoStatus))
      .optional(),
    relatedDate: zod.preprocess((v) => new Date(v), zod.date()).optional(),
    relatedDateAllDay: zod
      .preprocess((v) => v === 'on', zod.boolean())
      .optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
  })

  const submission = scheme.safeParse(jsonData)

  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (!submission.success) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.data

  const values: UpdateMemoModel = { id: memo.id }

  if (data.status !== undefined) {
    values.status = data.status
  }

  if (data.relatedDate !== undefined) {
    values.related_date = data.relatedDate?.toISOString() || null
    values.related_date_all_day = !!data.relatedDateAllDay
  }

  const updatedMemo = await updateMemo(values)

  return Response.json({ memo: updatedMemo })
}
