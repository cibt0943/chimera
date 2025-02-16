import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTask, updateTaskPosition } from '~/models/task.server'
import type { Route } from './+types/api.todo.position'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const fromTask = await getTask(params.todoId || '')
  if (fromTask.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const data = await request.json()
  const toTask = await getTask(data.toTaskId)
  if (toTask.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const updatedTask = await updateTaskPosition(fromTask.id, toTask.position)

  return Response.json({ task: updatedTask })
}
