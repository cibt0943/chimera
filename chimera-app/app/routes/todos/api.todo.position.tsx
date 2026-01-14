import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTodo, setTodoPosition } from '~/models/todo.server'
import type { Route } from './+types/api.todo.position'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  if (!params.todoId) {
    throw new Response('Not Found', { status: 404 })
  }

  const { toTodoId } = (await request.json()) as { toTodoId?: string }
  if (!toTodoId) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const [fromTodo, toTodo] = await Promise.all([
    getTodo(params.todoId),
    getTodo(toTodoId),
  ])

  if (
    fromTodo.accountId !== loginInfo.account.id ||
    toTodo.accountId !== loginInfo.account.id
  ) {
    throw new Response('Forbidden', { status: 403 })
  }

  const updatedTodo = await setTodoPosition(fromTodo.id, toTodo.position)

  return Response.json({ todo: updatedTodo })
}
