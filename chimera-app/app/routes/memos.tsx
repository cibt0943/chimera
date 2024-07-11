import { toDate } from 'date-fns'
import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, Outlet, useParams } from '@remix-run/react'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { Memo, MemoModels, MemoModel2Memo, MemoSchema } from '~/types/memos'
import { getMemos, insertMemo } from '~/models/memo.server'
import { ErrorView } from '~/components/lib/error-view'
import { MemoList } from '~/components/memo/memo-list'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'

export const meta: MetaFunction = () => {
  return [{ title: 'Memos | Kobushi' }]
}

export const action = withAuthentication(async ({ request, account }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: MemoSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
    // return json({ result: submission.reply() }, { status: 422 })
  }

  const data = submission.value

  const [title, ...content] = (data.content || '').split('\n')
  const newMemo = await insertMemo({
    title: title,
    content: content.join('\n'),
    related_date: data.related_date?.toISOString() || null,
    account_id: account.id,
  })

  return redirect(`/memos/${newMemo.id}`)
})

type LoaderData = {
  memoModels: MemoModels
  loadDate: string
}

export const loader = withAuthentication(async ({ account }) => {
  const memoModels = await getMemos(account.id)
  return json({ memoModels, loadDate: new Date().toISOString() })
})

export default function Layout() {
  const { memoModels, loadDate } = useLoaderData<LoaderData>()
  const loadMemos = memoModels.map<Memo>((value) => {
    return MemoModel2Memo(value)
  })

  const params = useParams()
  const { memoId } = params

  return (
    <div className="p-4 h-screen">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={30}>
          <MemoList
            defaultMemos={loadMemos}
            showId={memoId || ''}
            memosLoadDate={toDate(loadDate)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
