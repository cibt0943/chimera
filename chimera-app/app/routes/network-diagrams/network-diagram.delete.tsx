// app/routes/network-diagrams/network-diagram.delete.tsx
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import {
  getNetworkDiagram,
  deleteNetworkDiagram,
} from '~/models/network-diagram.server'
import type { Route } from './+types/network-diagram.delete'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)
  const diagram = await getNetworkDiagram(
    loginInfo.account.id,
    params.diagramId,
  )
  if (diagram.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  await deleteNetworkDiagram(loginInfo.account.id, diagram.id)
  return Response.json({ deletedDiagramId: diagram.id })
}
