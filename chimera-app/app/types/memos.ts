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
    dispOrder: 0,
    color: '',
  },
  {
    value: MemoStatus.ARCHIVED,
    label: 'task.model.status_list.archive',
    dispOrder: 2,
    color: 'bg-violet-600',
  },
]

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

export const MemoSchema = zod.object({
  status: zod.preprocess((v) => Number(v), zod.enum(MemoStatus)).optional(),
  content: zod
    .string()
    .max(60000, '60000文字以内で入力してください')
    .optional(),
  relatedDate: zod.date().optional(),
  relatedDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
})

export type MemoSchemaType = zod.infer<typeof MemoSchema>
