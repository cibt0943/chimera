// app/routes/network-diagrams/network-diagram.edit-title.tsx
import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import {
  getNetworkDiagram,
  updateNetworkDiagramTitle,
} from '~/models/network-diagram.server'
import { NetworkDiagramFormDialog } from '~/components/network-diagrams/network-diagram-form-dialog'
import { NetworkDiagramSchema } from '~/types/network-diagrams'
import type { Route } from './+types/network-diagram.edit-title'

async function requireAuthorizedDiagram(request: Request, diagramId: string) {
  const loginInfo = await isAuthenticated(request)
  const diagram = await getNetworkDiagram(loginInfo.account.id, diagramId)
  if (diagram.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }
  return { loginInfo, diagram }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { loginInfo, diagram } = await requireAuthorizedDiagram(
    request,
    params.diagramId,
  )
  const formData = await request.formData()

  const submission = parseWithZod(formData, { schema: NetworkDiagramSchema })
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  await updateNetworkDiagramTitle({
    id: diagram.id,
    account_id: loginInfo.account.id,
    title: submission.value.title,
  })

  return redirect(`/network-diagrams/${diagram.id}`)
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { diagram } = await requireAuthorizedDiagram(request, params.diagramId)
  return { diagram }
}

export default function NetworkDiagramEditTitle({
  loaderData,
}: Route.ComponentProps) {
  const { diagram } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300)
    navigate(`/network-diagrams/${diagram.id}`)
  }

  return (
    <NetworkDiagramFormDialog
      networkDiagram={diagram}
      action={`/network-diagrams/${diagram.id}/edit-title`}
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
    />
  )
}
