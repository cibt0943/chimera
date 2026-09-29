// app/routes/network-diagrams/index.tsx
import React, { useCallback } from 'react'
import { useDebounce } from '~/lib/hooks'
import { Link, Outlet, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getNetworkDiagrams } from '~/models/network-diagram.server'
import { Button } from '~/components/ui/button-base'
import { Input } from '~/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '~/components/ui/card'
import type { Route } from './+types/index'

export function meta() {
  return [{ title: 'Network Diagrams | IMA' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)
  return { diagrams: await getNetworkDiagrams(loginInfo.account.id) }
}

export default function NetworkDiagramsIndex({
  loaderData,
}: Route.ComponentProps) {
  const { diagrams } = loaderData
  const { t } = useTranslation()

  // 検索文字列
  const [searchTerm, setSearchTerm] = React.useState('')

  // フィルタリング後のネットワーク図一覧データ
  const dispDiagrams = React.useMemo(() => {
    if (!searchTerm) return diagrams
    return diagrams.filter((diagram) =>
      diagram.title.toLowerCase().includes(searchTerm),
    )
  }, [diagrams, searchTerm])

  // 300ms操作が止まってから?q= を更新する。
  // setSearchParams はクライアントサイドの遷移として扱われ、
  // loaderが再実行される(フルページ遷移は発生しない)。
  const searchDiagramsDebounce = useDebounce((searchTerm: string) => {
    setSearchTerm(searchTerm.toLowerCase())
  }, 300)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link to="create">
          <Button type="button" variant="secondary">
            <LuPlus />
            {t('common.message.add')}
          </Button>
        </Link>
        <Input
          type="search"
          placeholder={t('network_diagram.message.title_search')}
          onChange={(event) => searchDiagramsDebounce(event.target.value)}
          id="network-diagrams-title-search"
        />
      </div>

      {dispDiagrams.length === 0 ? (
        <div className="text-sm">{t('common.message.no_data')}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dispDiagrams.map((diagram) => (
            <Link key={diagram.id} to={diagram.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="truncate">
                    {diagram.title || t('network_diagram.message.untitled')}
                  </CardTitle>
                  <CardDescription>
                    {t('network_diagram.message.node_count')}:{' '}
                    {diagram.nodes.length}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="text-muted-foreground text-xs">
                  {t('common.message.updated')}:{' '}
                  {new Date(diagram.updatedAt).toLocaleString('ja-JP')}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* /network-diagrams/create がここにダイアログとして重なって表示される */}
      <Outlet />
    </div>
  )
}
