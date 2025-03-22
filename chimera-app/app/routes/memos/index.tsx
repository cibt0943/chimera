import { redirect } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { MEMO_URL } from '~/constants'
import { useMedia } from '~/lib/hooks'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { MemoFormView } from '~/components/memo/memo-form-view'
import { insertMemo } from '~/models/memo.server'
import { MemoSchema, MemoStatus } from '~/types/memos'
import type { Route } from './+types/index'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: MemoSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  const [title, ...content] = (data.content || '').split('\n')
  const newMemo = await insertMemo({
    account_id: loginInfo.account.id,
    title: title,
    content: content.join('\n'),
    status: MemoStatus.NOMAL,
    related_date: data.relatedDate?.toISOString() || null,
    related_date_all_day:
      data.relatedDateAllDay === undefined ? true : data.relatedDateAllDay,
  })

  return redirect(`${MEMO_URL}/${newMemo.id}`)
}

export default function Index() {
  const isLaptop = useMedia('(min-width: 1024px)', true)

  if (!isLaptop) return null

  return <MemoFormView memo={undefined} />
}
