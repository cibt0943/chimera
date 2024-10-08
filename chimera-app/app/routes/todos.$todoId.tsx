import * as React from 'react'
import { MetaFunction, redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { TODO_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { Task, TaskSchema } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Todo ' + data?.task.id + ' Edit | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const task = await getTask(params.todoId || '')
    if (task.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, { schema: TaskSchema })
    // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
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
  },
)

type LoaderData = {
  task: Task
}

export const loader = withAuthentication(async ({ params, loginSession }) => {
  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginSession.account.id) throw new Error('erorr')

  return typedjson({ task })
})

export default function Todo() {
  const { task } = useTypedLoaderData<LoaderData>()
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
