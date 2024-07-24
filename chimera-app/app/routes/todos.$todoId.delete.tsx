import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getTask, deleteTask } from '~/models/task.server'

export const action = withAuthentication(async ({ params, loginSession }) => {
  const task = await getTask(params.todoId || '')
  if (task.account_id !== loginSession.account.id) throw new Error('erorr')

  await deleteTask(task.id)

  return redirect('/todos')
})
