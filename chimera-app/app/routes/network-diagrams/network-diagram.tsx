// app/routes/network-diagrams/network-diagram.tsx
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuRows3 } from 'react-icons/lu'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getNetworkDiagram } from '~/models/network-diagram.server'
import { buttonVariants } from '~/components/ui/button-base'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
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
  const { t } = useTranslation()

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="border-b">
        {header(diagram.title || t('network_diagram.message.untitled'))}
      </div>
      <div className="flex-1">
        <CollaborativeFlow roomId={roomId} user={user} />
      </div>
    </div>
  )
}

function header(title: string) {
  return (
    <div className="px-4 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link to="/network-diagrams">Home</Link>}
            ></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
