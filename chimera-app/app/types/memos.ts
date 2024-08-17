import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'

export const MemoStatus = {
  NOMAL: 0,
  ARCHIVED: 1,
} as const
export type MemoStatus = (typeof MemoStatus)[keyof typeof MemoStatus]

// メモの全状態の値順リスト
export const MemoStatusList = [
  {
    value: MemoStatus.NOMAL,
    label: 'memo.model.status_list.nomal',
    dispOrder: 0,
    color: '',
  },
  {
    value: MemoStatus.ARCHIVED,
    label: 'task.model.status_list.archive',
    dispOrder: 2,
    color: 'bg-violet-600',
  }, //bg-orange-500
]

// DBのメモテーブルの型
export type MemoModel = Database['public']['Tables']['memos']['Row']
export type InsertMemoModel = Database['public']['Tables']['memos']['Insert']
export type UpdateMemoModel =
  Database['public']['Tables']['memos']['Update'] & { id: string } // idを必須で上書き

// メモの型
export type Memo = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  status: MemoStatus
  position: number
  title: string
  content: string
  relatedDate: Date | null
  relatedDateAllDay: boolean
}

export type Memos = Memo[]

export function MemoModel2Memo(memoModel: MemoModel): Memo {
  return {
    id: memoModel.id,
    createdAt: toDate(memoModel.created_at),
    updatedAt: toDate(memoModel.updated_at),
    accountId: memoModel.account_id,
    status: memoModel.status as MemoStatus,
    position: memoModel.position,
    title: memoModel.title,
    content: memoModel.content,
    relatedDate: memoModel.related_date ? toDate(memoModel.related_date) : null,
    relatedDateAllDay: memoModel.related_date_all_day,
  }
}

export const MemoSchema = zod.object({
  status: zod
    .preprocess((v) => Number(v), zod.nativeEnum(MemoStatus))
    .optional(),
  content: zod
    .string()
    .max(60000, '60000文字以内で入力してください')
    .optional(),
  relatedDate: zod.date().optional(),
  relatedDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
  returnUrl: zod.string().optional(),
})

export type MemoSchemaType = zod.infer<typeof MemoSchema>
