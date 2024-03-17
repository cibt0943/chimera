import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'
import { getTask, deleteTask } from '~/models/task.server'

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await authenticator.authenticate('auth0', request)

  const task = await getTask(Number(params.todoId))
  if (task.user_id !== user.id) {
    throw new Error('erorr')
  }

  await deleteTask(task.id)

  return redirect('/todos')
}
