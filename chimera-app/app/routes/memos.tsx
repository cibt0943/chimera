import { MetaFunction, redirect } from '@remix-run/node'
import { Outlet, useParams } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { MEMO_URL } from '~/constants'
import { useMedia } from '~/lib/hooks'
import { withAuthentication } from '~/lib/auth-middleware'
import { Memos, MemoSchema, MemoStatus } from '~/types/memos'
import { MemoSettings } from '~/types/memo-settings'
import { getMemos, insertMemo } from '~/models/memo.server'
import { getOrInsertMemoSettings } from '~/models/memo-settings.server'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'
import { ErrorView } from '~/components/lib/error-view'
import { MemoList } from '~/components/memo/memo-list'

export const meta: MetaFunction = () => {
  return [{ title: 'Memos | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: MemoSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
  }

  const data = submission.value

  const [title, ...content] = (data.content || '').split('\n')
  const newMemo = await insertMemo({
    account_id: loginSession.account.id,
    title: title,
    content: content.join('\n'),
    status: MemoStatus.NOMAL,
    related_date: data.relatedDate?.toISOString() || null,
    related_date_all_day:
      data.relatedDateAllDay === undefined ? true : data.relatedDateAllDay,
  })

  return redirect([MEMO_URL, newMemo.id].join('/'))
})

type LoaderData = {
  memos: Memos
  memoSettings: MemoSettings
}

export const loader = withAuthentication(async ({ loginSession }) => {
  const memoSettings = await getOrInsertMemoSettings(loginSession.account.id)
  const memos = await getMemos(loginSession.account.id, {
    statuses: memoSettings.listFilter.statuses,
  })

  return typedjson({
    memos,
    memoSettings,
  })
})

export default function Layout() {
  const { memos, memoSettings } = useTypedLoaderData<LoaderData>()

  const params = useParams()
  const { memoId } = params

  const isLaptop = useMedia('(min-width: 1024px)', true)

  if (!isLaptop) {
    return (
      <div className="pt-1">
        <MemoList
          defaultMemos={memos}
          showId={memoId || ''}
          memoSettings={memoSettings}
        />
        <Outlet />
      </div>
    )
  }

  return (
    <div className="p-4 pt-1 xl:pt-4">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={35}>
          <MemoList
            defaultMemos={memos}
            showId={memoId || ''}
            memoSettings={memoSettings}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
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
