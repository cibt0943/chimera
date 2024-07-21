import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Outlet, useParams } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { Memos, MemoSchema, MemoStatus } from '~/types/memos'
import { MemoSettings } from '~/types/memo-settings'
import { getMemos, insertMemo } from '~/models/memo.server'
import { getOrInsertMemoSettings } from '~/models/memo-settings.server'
import { ErrorView } from '~/components/lib/error-view'
import { MemoList } from '~/components/memo/memo-list'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'
import { useSetAtom } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

export const meta: MetaFunction = () => {
  return [{ title: 'Memos | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
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
    account_id: loginSession.account.id,
    title: title,
    content: content.join('\n'),
    status: MemoStatus.NOMAL,
    related_date: data.related_date?.toISOString() || null,
  })

  return redirect(`/memos/${newMemo.id}`)
})

type LoaderData = {
  memos: Memos
  loadDate: Date
  memoSettings: MemoSettings
}

export const loader = withAuthentication(async ({ loginSession }) => {
  const memoSettings = await getOrInsertMemoSettings(loginSession.account.id)
  const memos = await getMemos(
    loginSession.account.id,
    memoSettings.list_filter.statuses,
  )

  return typedjson({
    memos,
    loadDate: new Date(),
    memoSettings,
  })
})

export default function Layout() {
  const { memos, loadDate, memoSettings } = useTypedLoaderData<LoaderData>()

  // ログインユーザーのアカウント情報をグローバルステートに保存
  const setMemoSettings = useSetAtom(memoSettingsAtom)
  React.useEffect(() => {
    setMemoSettings(memoSettings)
  }, [setMemoSettings, memoSettings])

  const params = useParams()
  const { memoId } = params

  return (
    <div className="p-4 h-screen">
      <ResizablePanelGroup direction="horizontal" className="border rounded-lg">
        <ResizablePanel defaultSize={35}>
          <MemoList
            defaultMemos={memos}
            memosLoadDate={loadDate}
            showId={memoId || ''}
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
