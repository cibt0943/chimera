import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo } from '~/models/memo.server'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'
import type { Route } from './+types/memo'

export function meta({ params }: Route.MetaArgs) {
  return [{ title: 'Memo ' + params.memoId + ' Edit | IMA' }]
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
  const redirectUrl = EVENT_URL + location.search

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      onOpenChange={async (open) => {
        setIsOpenDialog(open)
        if (open) return
        navigate(redirectUrl)
      }}
      redirectUrl={redirectUrl}
    />
  )
}
