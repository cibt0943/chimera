import * as zod from 'zod'
import { MemoStatus } from '~/types/memos'

export type MemoSettings = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  listFilter: {
    statuses: MemoStatus[]
  }
  autoSave: boolean
}

export type UpdateParams = {
  list_filter?: MemoSettings['listFilter']
  auto_save?: boolean
}

const ListFilterSchema = zod.object({
  statuses: zod.array(
    zod.enum(MemoStatus, {
      message: '不正な値が選択されています。',
    }),
  ),
})

export const MemoSettingsSchema = zod.object({
  listFilter: ListFilterSchema.optional(),
  autoSave: zod.boolean().optional(),
})

export type MemoSettingsSchemaType = zod.infer<typeof MemoSettingsSchema>
