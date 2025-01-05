import * as React from 'react'
import { redirectWithSuccess } from 'remix-toast'
import { parseWithZod } from '@conform-to/zod'
import { MEMO_URL } from '~/constants'
import { useMedia } from '~/lib/hooks'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoFormView } from '~/components/memo/memo-form-view'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'
import type { Route } from './+types/memo'
import { MemoSchema } from '~/types/memos'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: 'Memo ' + data?.memo.id + ' | IMA' }]
}

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const memo = await getMemo(params.memoId || '')
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: MemoSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  const [title, ...content] = (data.content || '').split('\n')
  const updatedMemo = await updateMemo({
    id: memo.id,
    title: title,
    content: content.join('\n'),
    related_date: data.relatedDate?.toISOString() || null,
    related_date_all_day: !!data.relatedDateAllDay,
  })

  const redirectUrl = formData.get('returnUrl') as string
  return redirectUrl
    ? redirectWithSuccess(redirectUrl, 'memo.message.updated')
    : { updatedMemo }
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
  const isLaptop = useMedia('(min-width: 1024px)', true)
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)

  if (isLaptop) {
    // const returnUrl = memo ? [MEMO_URL, memo.id].join('/') : MEMO_URL
    const returnUrl = '' //画面遷移しないので、returnUrlは空文字
    return <MemoFormView memo={memo} returnUrl={returnUrl} />
  }

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
      returnUrl={MEMO_URL}
    />
  )
}
