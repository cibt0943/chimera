import * as React from 'react'
import { redirectWithSuccess } from 'remix-toast'
import { parseWithZod } from '@conform-to/zod'
import { TODO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask, updateTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import type { Route } from './+types/todo'
import { TaskSchema } from '~/types/tasks'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: 'Todo ' + data?.task.id + ' Edit | IMA' }]
}

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  await updateTask({
    id: task.id,
    status: data.status,
    title: data.title,
    memo: data.memo || '',
    due_date: data.dueDate?.toISOString() || null,
    due_date_all_day: !!data.dueDateAllDay,
  })

  const redirectUrl = (formData.get('returnUrl') as string) || TODO_URL
  return redirectWithSuccess(redirectUrl, 'task.message.updated')
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

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
      returnUrl={TODO_URL}
    />
  )
}
