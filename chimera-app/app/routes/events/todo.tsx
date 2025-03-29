import * as React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { EVENT_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import type { Route } from './+types/todo'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: 'Todo ' + data?.task.id + ' Edit | IMA' }]
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
  const returnUrl = EVENT_URL + location.search

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      onOpenChange={async (open) => {
        if (open) return
        setIsOpenDialog(false)
        await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
        navigate(returnUrl)
      }}
      returnUrl={returnUrl}
    />
  )
}
