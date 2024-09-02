import * as React from 'react'
import { MetaFunction } from '@remix-run/node'
import { useLocation } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { EVENT_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import type { Memo } from '~/types/memos'
import { getMemo } from '~/models/memo.server'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Memo ' + data?.memo.id + ' Edit | Kobushi' }]
}

type LoaderData = {
  memo: Memo
}

export const loader = withAuthentication(async ({ params, loginSession }) => {
  const memo = await getMemo(params.memoId || '')
  if (memo.accountId !== loginSession.account.id) throw new Error('erorr')

  return typedjson({ memo })
})

export default function Memo() {
  const { memo } = useTypedLoaderData<LoaderData>()
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
