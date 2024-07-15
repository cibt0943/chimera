import { toDate } from 'date-fns'
import * as zod from 'zod'

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
    disp_order: 0,
    color: '',
  },
  {
    value: MemoStatus.ARCHIVED,
    label: 'task.model.status_list.archive',
    disp_order: 2,
    color: 'bg-violet-600',
  }, //bg-orange-500
]

export type Memo = {
  id: string
  created_at: Date
  updated_at: Date
  account_id: string
  // position: number
  title: string
  content: string
  status: MemoStatus
  related_date: Date | null
}

export type Memos = Memo[]

export type MemoModel = {
  id: string
  created_at: string
  updated_at: string
  account_id: string
  position: number
  title: string
  content: string
  status: number
  related_date: string | null
}

export type MemoModels = MemoModel[]

export function MemoModel2Memo(memoModel: MemoModel): Memo {
  return {
    id: memoModel.id,
    created_at: toDate(memoModel.created_at),
    updated_at: toDate(memoModel.updated_at),
    account_id: memoModel.account_id,
    title: memoModel.title,
    content: memoModel.content,
    status: memoModel.status as MemoStatus,
    related_date: memoModel.related_date
      ? toDate(memoModel.related_date)
      : null,
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
  // status: zod.nativeEnum(MemoStatus).optional(),
  related_date: zod.date().optional(),
})

export type MemoSchemaType = zod.infer<typeof MemoSchema>
