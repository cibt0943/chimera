import * as React from 'react'
import { MetaFunction } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { EVENT_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { Task } from '~/types/tasks'
import { getTask } from '~/models/task.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Todo ' + data?.task.id + ' Edit | Kobushi' }]
}

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
      returnUrl={EVENT_URL}
    />
  )
}
