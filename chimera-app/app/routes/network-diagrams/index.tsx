// app/routes/network-diagrams/index.tsx
import { Link, Outlet } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getNetworkDiagrams } from '~/models/network-diagram.server'
import { Button } from '~/components/ui/button-base'
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

  return (
    <div className="p-4 pt-1 md:pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ネットワーク図</h1>
        <Button asChild>
          <Link to="create">＋ 新規作成</Link>
        </Button>
      </div>

      {diagrams.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          まだネットワーク図がありません。「＋ 新規作成」から作成してください。
        </p>
      ) : (
        <ul className="divide-y">
          {diagrams.map((diagram) => (
            <li
              key={diagram.id}
              className="flex items-center justify-between py-2"
            >
              <Link to={diagram.id} className="hover:underline">
                {diagram.title || '(無題のネットワーク図)'}
              </Link>
              <span className="text-muted-foreground text-xs">
                ノード数: {diagram.nodes.length} / 更新:{' '}
                {new Date(diagram.updatedAt).toLocaleString('ja-JP')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* /network-diagrams/create がここにダイアログとして重なって表示される */}
      <Outlet />
    </div>
  )
}
