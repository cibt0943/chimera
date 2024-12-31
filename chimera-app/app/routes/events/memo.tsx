import * as React from 'react'
import { useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
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
  if (memo.accountId !== loginInfo.account.id) throw new Error('erorr')

  return { memo }
}

export default function Memo({ loaderData }: Route.ComponentProps) {
  const { memo } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const location = useLocation()
  const returnUrl = EVENT_URL + location.search

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
      returnUrl={returnUrl}
    />
  )
}
