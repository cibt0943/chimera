import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { ClientOnly } from 'remix-utils/client-only'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import type { Memo } from '~/types/memos'
import { MemoSchema } from '~/types/memos'
import { getMemo, updateMemo } from '~/models/memo.server'
import { MemoForm } from '~/components/memo/memo-form'

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
      // return json({ result: submission.reply() }, { status: 422 })
    }

    const data = submission.value

    const [title, ...content] = (data.content || '').split('\n')
    await updateMemo({
      id: memo.id,
      title: title,
      content: content.join('\n'),
      related_date: data.relatedDate?.toISOString() || null,
    })

    return redirect(`/memos/${memo.id}`)
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

  return <ClientOnly>{() => <MemoForm memo={memo} />}</ClientOnly>
}
