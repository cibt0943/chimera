import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
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

  await insertMemo({
    title: data.title,
    content: data.content || '',
    related_date: data.related_date?.toISOString() || null,
    account_id: account.id,
  })

  return redirect('/memos')
})

type LoaderData = {
  memoModels: MemoModels
}

export const loader = withAuthentication(async ({ account }) => {
  const memoModels = await getMemos(account.id)
  return json({ memoModels })
})

export default function Layout() {
  const { memoModels } = useLoaderData<LoaderData>()
  const memos = memoModels.map<Memo>((value) => {
    return MemoModel2Memo(value)
  })

  return (
    <div className="p-4 h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30}>
          <MemoList items={memos} />
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
