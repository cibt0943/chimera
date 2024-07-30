import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'
import { MemoStatus } from '~/types/memos'

// DBのアカウントメモ設定テーブルの型
export type MemoSettingsModel =
  Database['public']['Tables']['memo_settings']['Row']
type _UpdateMemoSettingsModel =
  Database['public']['Tables']['memo_settings']['Update']
export type UpdateMemoSettingsModel = Required<
  Pick<_UpdateMemoSettingsModel, 'id'>
> &
  Partial<Omit<_UpdateMemoSettingsModel, 'id'>> // idを取り除いて必須で追加

export type MemoSettings = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  listFilter: {
    statuses: MemoStatus[]
  }
  listDisplay: {
    content: boolean
  }
  autoSave: boolean
}

export function MemoSettingsModel2MemoSettings(
  MemoSettingsModel: MemoSettingsModel,
): MemoSettings {
  return {
    id: MemoSettingsModel.id,
    createdAt: toDate(MemoSettingsModel.created_at),
    updatedAt: toDate(MemoSettingsModel.updated_at),
    accountId: MemoSettingsModel.account_id,
    listFilter: MemoSettingsModel.list_filter as MemoSettings['listFilter'],
    listDisplay: MemoSettingsModel.list_display as MemoSettings['listDisplay'],
    autoSave: MemoSettingsModel.auto_save,
  }
}

export type UpdateParams = {
  list_filter?: MemoSettings['listFilter']
  list_display?: MemoSettings['listDisplay']
  auto_save?: boolean
}

const ListFilterSchema = zod.object({
  statuses: zod.array(
    zod.nativeEnum(MemoStatus, {
      message: '不正な値が選択されています。',
    }),
  ),
})

const ListDisplaySchema = zod.object({
  content: zod.boolean({
    message: '不正な値が選択されています。',
  }),
})

export const MemoSettingsSchema = zod.object({
  listFilter: ListFilterSchema.optional(),
  listDisplay: ListDisplaySchema.optional(),
  autoSave: zod.boolean().optional(),
})

export type MemoSettingsSchemaType = zod.infer<typeof MemoSettingsSchema>
