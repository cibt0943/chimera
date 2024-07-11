import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, Outlet, useParams } from '@remix-run/react'
import { toDate } from 'date-fns'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import {
  Memo,
  MemoModels,
  MemoModel2Memo,
  MemoSchema,
  MemoStatus,
} from '~/types/memos'
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
    account_id: account.id,
    title: title,
    content: content.join('\n'),
    status: data.status || MemoStatus.NOMAL,
    related_date: data.related_date?.toISOString() || null,
  })

  return redirect(`/memos/${newMemo.id}`)
})

type LoaderData = {
  memoModels: MemoModels
  loadDate: string
  requestSearchParams: URLSearchParams
}

export const loader = withAuthentication(async ({ request, account }) => {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const status = searchParams.get('status') as MemoStatus | null

  const statuses =
    status == MemoStatus.ARCHIVE
      ? [MemoStatus.NOMAL, MemoStatus.ARCHIVE]
      : [MemoStatus.NOMAL]

  const memoModels = await getMemos(account.id, statuses)
  return json({
    memoModels,
    loadDate: new Date().toISOString(),
    requestSearchParams: searchParams,
  })
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
