import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask, updateTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import type { Route } from './+types/todo'
import { TaskSchema } from '~/types/tasks'

export function meta({ data }: Route.MetaArgs) {
  return data.task
    ? [{ title: 'Todo ' + data.task?.id + ' Edit | IMA' }]
    : [{ title: 'Todo Add | IMA' }]
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
  return redirect(redirectUrl)
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  if (params.todoId === 'new') return { task: undefined }

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { task }
}

export default function Todo({ loaderData }: Route.ComponentProps) {
  const { task } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      onOpenChange={async (open) => {
        if (!open) {
          setIsOpenDialog(false)
          await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
          navigate(TODO_URL)
        }
      }}
      returnUrl={TODO_URL}
    />
  )
}
