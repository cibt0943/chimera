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
type _UpdateMemoModel = Database['public']['Tables']['memos']['Update']
export type UpdateMemoModel = Required<Pick<_UpdateMemoModel, 'id'>> &
  Partial<Omit<_UpdateMemoModel, 'id'>> // idを取り除いて必須で追加

// メモの型
export type Memo = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  position: number
  title: string
  content: string
  status: MemoStatus
  relatedDate: Date | null
}

export type Memos = Memo[]

export function MemoModel2Memo(memoModel: MemoModel): Memo {
  return {
    id: memoModel.id,
    createdAt: toDate(memoModel.created_at),
    updatedAt: toDate(memoModel.updated_at),
    accountId: memoModel.account_id,
    position: memoModel.position,
    title: memoModel.title,
    content: memoModel.content,
    status: memoModel.status as MemoStatus,
    relatedDate: memoModel.related_date ? toDate(memoModel.related_date) : null,
  }
}

export const MemoSchema = zod.object({
  content: zod
    .string()
    .max(60000, '60000文字以内で入力してください')
    .optional(),
  status: zod
    .preprocess((v) => Number(v), zod.nativeEnum(MemoStatus))
    .optional(),
  relatedDate: zod.date().optional(),
})

export type MemoSchemaType = zod.infer<typeof MemoSchema>
