import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { TaskSchema } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Todo ' + data?.task.id + ' Edit | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const task = await getTask(Number(params.todoId))
    if (task.account_id !== account.id) throw new Error('erorr')

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
      due_date: data.due_date?.toISOString() || null,
      account_id: account.id,
      updated_at: new Date().toISOString(),
    })

    return redirect('/todos')
  },
)

export const loader = withAuthentication(async ({ params, account }) => {
  const task = await getTask(Number(params.todoId))
  if (task.account_id !== account.id) throw new Error('erorr')

  return json({ task })
})

export default function Todo() {
  const { task } = useLoaderData<typeof loader>()
  const [isOpenDialog, setIsOpenDialog] = React.useState(false)

  React.useEffect(() => {
    setIsOpenDialog(true)
  }, [])

  return (
    <TaskFormDialog
      task={task}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
    />
  )
}
