import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import type { Route } from './+types/task'

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Task ${params.taskId} Edit | IMA` }]
}

async function requireAuthorizedTask(request: Request, taskId: string) {
  const loginInfo = await isAuthenticated(request)
  const task = await getTask(taskId)
  if (task.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { task }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return await requireAuthorizedTask(request, params.taskId)
}

export default function Task({ loaderData }: Route.ComponentProps) {
  const { task } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const redirectUrl = `${EVENT_URL}${location.search}`

  const onOpenChange = (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    navigate(redirectUrl)
  }

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
      redirectUrl={redirectUrl}
    />
  )
}
