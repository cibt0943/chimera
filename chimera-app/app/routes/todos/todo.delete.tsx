import { redirect } from 'react-router'
import { TODO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask, deleteTask } from '~/models/task.server'
import type { Route } from './+types/todo.delete'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) throw new Error('erorr')

  await deleteTask(task.id)

  const formData = await request.formData()
  const returnUrl = formData.get('returnUrl') as string | undefined
  return redirect(returnUrl || TODO_URL)
}
