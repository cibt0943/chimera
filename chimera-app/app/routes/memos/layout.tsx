import { Outlet, useParams } from 'react-router'
import { useMedia } from '~/lib/hooks'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getMemos } from '~/models/memo.server'
import { getOrAddMemoSettings } from '~/models/memo-settings.server'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '~/components/ui/resizable'
import { MemoList } from '~/components/memo/memo-list'
import type { Route } from './+types/layout'

export function meta() {
  return [{ title: 'Memos | IMA' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const memoSettings = await getOrAddMemoSettings(loginInfo.account.id)
  const memos = await getMemos(loginInfo.account.id, {
    statuses: memoSettings.listFilter.statuses,
  })

  return {
    memos,
    memoSettings,
  }
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const { memos, memoSettings } = loaderData
  const isLaptop = useMedia('(min-width: 1024px)', true)

  const { memoId } = useParams()

  const memo = memos.find((m) => m.id === memoId)

  const memoList = (
    <MemoList
      originalMemos={memos}
      selectedMemo={memo}
      memoSettings={memoSettings}
    />
  )

  if (!isLaptop) {
    return (
      <>
        {memoList}
        <Outlet />
      </>
    )
  }

  return (
    <div className="p-4">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={35}>{memoList}</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
