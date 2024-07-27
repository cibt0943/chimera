import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import {
  getMemoSettings,
  updateMemoSettings,
} from '~/models/memo-settings.server'
import { UpdateParams, MemoSettingsSchema } from '~/types/memo-settings'

export const action = withAuthentication(async ({ request, loginSession }) => {
  const memoSettings = await getMemoSettings(loginSession.account.id)

  const submission = MemoSettingsSchema.safeParse(await request.json())
  if (!submission.success) throw new Error('Invalid submission data.')
  const data = submission.data

  // アカウントのメモ設定情報を更新
  const updateData: UpdateParams = {}
  if (data.listFilter !== undefined) {
    updateData.list_filter = {
      ...memoSettings.listFilter,
      statuses: data.listFilter.statuses,
    }
  }
  if (data.listDisplay !== undefined) {
    updateData.list_display = {
      ...memoSettings.listDisplay,
      content: data.listDisplay.content,
    }
  }
  if (data.autoSave !== undefined) {
    updateData.auto_save = data.autoSave
  }

  const updatedMemoSettings = await updateMemoSettings({
    id: memoSettings.id,
    ...updateData,
  })

  return json({ success: true, updatedMemoSettings })
})

export const loader = withAuthentication(async ({ loginSession }) => {
  const memoSettings = await getMemoSettings(loginSession.account.id)
  return json({ memoSettings })
})
