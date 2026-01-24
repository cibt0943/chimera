import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { MEMO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { useMedia } from '~/lib/hooks'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoFormView } from '~/components/memo/memo-form-view'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'
import { MemoSchema } from '~/types/memos'
import type { Route } from './+types/memo'

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Memo ${params.memoId} | IMA` }]
}

async function requireAuthorizedMemo(request: Request, memoId: string) {
  const loginInfo = await isAuthenticated(request)
  const memo = await getMemo(memoId)
  if (memo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { memo }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { memo } = await requireAuthorizedMemo(request, params.memoId)

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: MemoSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  const [title, ...content] = (data.content ?? '').split('\n')
  const updatedMemo = await updateMemo({
    id: memo.id,
    title,
    content: content.join('\n'),
    related_date: data.relatedDate?.toISOString() ?? null,
    related_date_all_day: Boolean(data.relatedDateAllDay),
  })

  const redirectUrl = formData.get('redirectUrl')?.toString()
  return redirectUrl ? redirect(redirectUrl) : { updatedMemo }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return await requireAuthorizedMemo(request, params.memoId)
}

export default function Memo({ loaderData }: Route.ComponentProps) {
  const { memo } = loaderData
  const isLaptop = useMedia('(min-width: 1024px)', true)
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()
  const redirectUrl = MEMO_URL

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
    navigate(redirectUrl)
  }

  if (isLaptop) {
    return <MemoFormView memo={memo} />
  }

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
      redirectUrl={redirectUrl}
    />
  )
}
