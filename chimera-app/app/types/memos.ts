import * as zod from 'zod'
import { toDate } from 'date-fns'

export type Memo = {
  id: number
  title: string
  content: string
  related_date: Date | null
  account_id: number
  created_at: Date
  updated_at: Date
}

export type Memos = Memo[]

export type MemoModel = {
  id: number
  title: string
  content: string
  related_date: string | null
  position: number
  account_id: number
  created_at: string
  updated_at: string
}

export type MemoModels = MemoModel[]

export function MemoModel2Memo(memoModel: MemoModel): Memo {
  return {
    id: memoModel.id,
    title: memoModel.title,
    content: memoModel.content,
    related_date: memoModel.related_date
      ? toDate(memoModel.related_date)
      : null,
    account_id: memoModel.account_id,
    created_at: toDate(memoModel.created_at),
    updated_at: toDate(memoModel.updated_at),
  }
}

export const MemoSchema = zod.object({
  title: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  content: zod
    .string()
    .max(60000, '60000文字以内で入力してください')
    .optional(),
  related_date: zod.date().optional(),
})

export type MemoSchemaType = zod.infer<typeof MemoSchema>
