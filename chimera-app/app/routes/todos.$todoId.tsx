import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
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
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
      // return json({ result: submission.reply() }, { status: 422 })
    }

    const data = submission.value

    await updateTask({
      id: task.id,
      title: data.title,
      memo: data.memo || '',
      status: data.status,
      due_date: data.dueDate?.toISOString() || null,
    })

    return redirect('/todos')
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
    />
  )
}
