// app/routes/network-diagrams/network-diagram.tsx
import { Outlet, useNavigate } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getNetworkDiagram } from '~/models/network-diagram.server'
import { Button } from '~/components/ui/button-base'
import CollaborativeFlow from '~/components/network-diagrams/CollaborativeFlow'
import type { Route } from './+types/network-diagram'

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData.diagram.title || '無題'} | IMA` }]
}

async function requireAuthorizedDiagram(request: Request, diagramId: string) {
  const loginInfo = await isAuthenticated(request)
  const diagram = await getNetworkDiagram(loginInfo.account.id, diagramId)
  if (diagram.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }
  return { loginInfo, diagram }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { loginInfo, diagram } = await requireAuthorizedDiagram(
    request,
    params.diagramId,
  )

  return {
    diagram,
    roomId: `diagram:${diagram.id}`,
    user: loginInfo.auth0User,
  }
}

export default function NetworkDiagramRoute({
  loaderData,
}: Route.ComponentProps) {
  const { diagram, roomId, user } = loaderData
  const navigate = useNavigate()

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-base font-medium">
          {diagram.title || '(無題)'}
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('edit-title')}
        >
          タイトルを編集
        </Button>
      </div>
      <div className="flex-1">
        <CollaborativeFlow roomId={roomId} user={user} />
      </div>

      {/* /network-diagrams/:diagramId/edit-title がここにダイアログとして重なる */}
      <Outlet />
    </div>
  )
}
