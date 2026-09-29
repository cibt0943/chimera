// app/routes/network-diagrams/network-diagram.create.tsx
import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { addNetworkDiagram } from '~/models/network-diagram.server'
import { NetworkDiagramFormDialog } from '~/components/network-diagrams/network-diagram-form-dialog'
import { NetworkDiagramSchema } from '~/types/network-diagrams'
import type { Route } from './+types/network-diagram.create'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)
  const formData = await request.formData()

  const submission = parseWithZod(formData, { schema: NetworkDiagramSchema })
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const diagram = await addNetworkDiagram(
    loginInfo.account.id,
    submission.value.title,
  )
  return redirect(`/network-diagrams/${diagram.id}`)
}

export default function NetworkDiagramCreate() {
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
    navigate('/network-diagrams')
  }

  return (
    <NetworkDiagramFormDialog
      networkDiagram={undefined}
      action="/network-diagrams/create"
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
    />
  )
}
