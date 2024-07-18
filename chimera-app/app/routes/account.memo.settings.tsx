import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import {
  getMemoSettings,
  updateMemoSettings,
} from '~/models/memo-settings.server'
import { MemoSettingsSchema } from '~/types/memo-settings'

export const action = withAuthentication(async ({ request, loginSession }) => {
  const memoSettings = await getMemoSettings(loginSession.account.id)

  const submission = MemoSettingsSchema.safeParse(await request.json())
  if (!submission.success) throw new Error('Invalid submission data.')
  const data = submission.data

  // アカウントのメモ設定情報を更新
  const updatedMemoSettings = await updateMemoSettings({
    id: memoSettings.id,
    list_filter: {
      ...memoSettings.list_filter,
      statuses: data.list_filter.statuses,
    },
  })

  return json({ success: true, updatedMemoSettings })
})

export const loader = withAuthentication(async ({ loginSession }) => {
  const memoSettings = await getMemoSettings(loginSession.account.id)
  return json({ memoSettings })
})
