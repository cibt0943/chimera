import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { MemoSchema } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoForm } from '~/components/memo/memo-form'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Memo ' + data?.memo.id + ' | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.account_id !== account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, { schema: MemoSchema })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
      // return json({ result: submission.reply() }, { status: 422 })
    }

    const data = submission.value

    await updateMemo({
      id: memo.id,
      title: data.title,
      content: data.content || '',
      related_date: data.related_date?.toISOString() || null,
      account_id: account.id,
      updated_at: new Date().toISOString(),
    })

    return redirect('/memos/' + memo.id)
  },
)

export const loader = withAuthentication(async ({ params, account }) => {
  const memo = await getMemo(params.memoId || '')
  if (memo.account_id !== account.id) throw new Error('erorr')

  return json({ memo })
})

export default function Memo() {
  const { memo } = useLoaderData<typeof loader>()

  return <ClientOnly>{() => <MemoForm memo={memo} />}</ClientOnly>
}
