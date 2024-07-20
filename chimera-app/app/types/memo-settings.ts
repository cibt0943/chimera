import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'
import { MemoStatus } from '~/types/memos'

// DBのアカウントメモ設定テーブルの型
export type MemoSettingsModel =
  Database['public']['Tables']['memo_settings']['Row']

export type MemoSettings = {
  id: string
  created_at: Date
  updated_at: Date
  account_id: string
  list_filter: {
    statuses: MemoStatus[]
  }
  list_display: {
    content: boolean
  }
  auto_save: boolean
}

export function MemoSettingsModel2MemoSettings(
  MemoSettingsModel: MemoSettingsModel,
): MemoSettings {
  return {
    id: MemoSettingsModel.id,
    created_at: toDate(MemoSettingsModel.created_at),
    updated_at: toDate(MemoSettingsModel.updated_at),
    account_id: MemoSettingsModel.account_id,
    list_filter: MemoSettingsModel.list_filter as MemoSettings['list_filter'],
    list_display:
      MemoSettingsModel.list_display as MemoSettings['list_display'],
    auto_save: MemoSettingsModel.auto_save,
  }
}

export type UpdateParams = {
  list_filter?: MemoSettings['list_filter']
  list_display?: MemoSettings['list_display']
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
  list_filter: ListFilterSchema.optional(),
  list_display: ListDisplaySchema.optional(),
})

export type MemoSettingsSchemaType = zod.infer<typeof MemoSettingsSchema>
