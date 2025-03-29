import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo } from '~/models/memo.server'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'
import type { Route } from './+types/memo'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: 'Memo ' + data?.memo.id + ' Edit | IMA' }]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const memo = await getMemo(params.memoId || '')
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { memo }
}

export default function Memo({ loaderData }: Route.ComponentProps) {
  const { memo } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const returnUrl = EVENT_URL + location.search

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      onOpenChange={async (open) => {
        if (open) return
        setIsOpenDialog(false)
        await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
        navigate(returnUrl)
      }}
      returnUrl={returnUrl}
    />
  )
}
