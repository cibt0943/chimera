import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, updateMemo, UpdateMemoModel } from '~/models/memo.server'
import { MemoStatus } from '~/types/memos'
import type { Route } from './+types/api.memo'

const UpdateMemoSchema = zod.object({
  status: zod.preprocess((v) => Number(v), zod.enum(MemoStatus)).optional(),
  relatedDate: zod
    .preprocess((v) => new Date(String(v)), zod.date())
    .optional(),
  relatedDateAllDay: zod
    .preprocess(
      (v) => (typeof v === 'boolean' ? v : String(v) === 'on'),
      zod.boolean(),
    )
    .optional(),
})

async function requireAuthorizedMemo(request: Request, memoId: string) {
  const loginInfo = await isAuthenticated(request)
  const memo = await getMemo(memoId)
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { memo }
}

// メモの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const { memo } = await requireAuthorizedMemo(request, params.memoId)

  const jsonData = await request.json()
  const submission = UpdateMemoSchema.safeParse(jsonData)

  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (!submission.success) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const values: UpdateMemoModel = { id: memo.id }
  const data = submission.data

  if (data.status !== undefined) {
    values.status = data.status
  }

  if (data.relatedDate !== undefined) {
    values.related_date = data.relatedDate?.toISOString() ?? null
    values.related_date_all_day = Boolean(data.relatedDateAllDay)
  }

  const updatedMemo = await updateMemo(values)

  return Response.json({ memo: updatedMemo })
}
