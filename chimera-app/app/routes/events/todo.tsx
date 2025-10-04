import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import type { Route } from './+types/todo'

export function meta({ params }: Route.MetaArgs) {
  return [{ title: 'Todo ' + params.todoId + ' Edit | IMA' }]
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { task }
}

export default function Todo({ loaderData }: Route.ComponentProps) {
  const { task } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const redirectUrl = EVENT_URL + location.search

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      onOpenChange={async (open) => {
        setIsOpenDialog(open)
        if (open) return
        navigate(redirectUrl)
      }}
      redirectUrl={redirectUrl}
    />
  )
}
