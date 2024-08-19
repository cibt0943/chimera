import { MetaFunction, redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { ClientOnly } from 'remix-utils/client-only'
import { parseWithZod } from '@conform-to/zod'
import { MEMO_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import type { Memo } from '~/types/memos'
import { MemoSchema } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoFormView } from '~/components/memo/memo-form-view'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Memo ' + data?.memo.id + ' | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const memo = await getMemo(params.memoId || '')
    if (memo.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, { schema: MemoSchema })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
    }

    const data = submission.value

    const [title, ...content] = (data.content || '').split('\n')
    await updateMemo({
      id: memo.id,
      title: title,
      content: content.join('\n'),
      related_date: data.relatedDate?.toISOString() || null,
      related_date_all_day: !!data.relatedDateAllDay,
    })

    const redirectUrl =
      (formData.get('returnUrl') as string) || [MEMO_URL, memo.id].join('/')
    return redirect(redirectUrl)
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

  return <ClientOnly>{() => <MemoFormView memo={memo} />}</ClientOnly>
}
