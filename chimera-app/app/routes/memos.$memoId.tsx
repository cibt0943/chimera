import * as React from 'react'
import { MetaFunction, redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { MEMO_URL } from '~/constants'
import { useMedia } from '~/lib/hooks'
import { withAuthentication } from '~/lib/auth-middleware'
import type { Memo } from '~/types/memos'
import { MemoSchema } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoFormView } from '~/components/memo/memo-form-view'
import { MemoFormDialog } from '~/components/memo/memo-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Memo ' + data?.memo.id + ' | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, { schema: MemoSchema })
    // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
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
    if (redirectUrl) {
      return redirect(redirectUrl)
    }

    return typedjson({ updatedMemo })
  },
)

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
  const isLaptop = useMedia('(min-width: 1024px)', true)
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const returnUrl = MEMO_URL

  if (isLaptop) {
    return <MemoFormView memo={memo} />
  }

  return (
    <MemoFormDialog
      memo={memo}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
      returnUrl={returnUrl}
    />
  )
}
