import { isAuthenticated } from '~/lib/auth/auth-middleware'
import {
  getMemoSettings,
  updateMemoSettings,
} from '~/models/memo-settings.server'
import type { Route } from './+types/memo.settings'
import { UpdateParams, MemoSettingsSchema } from '~/types/memo-settings'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const memoSettings = await getMemoSettings(loginInfo.account.id)

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

  return { memoSettings: updatedMemoSettings }
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const memoSettings = await getMemoSettings(loginInfo.account.id)
  return { memoSettings }
}
