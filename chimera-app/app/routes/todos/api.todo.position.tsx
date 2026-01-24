import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTodo, setTodoPosition } from '~/models/todo.server'
import type { Route } from './+types/api.todo.position'

async function requireAuthorizedTodo(request: Request, todoId: string) {
  const loginInfo = await isAuthenticated(request)
  const todo = await getTodo(todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { loginInfo, todo }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { loginInfo, todo: fromTodo } = await requireAuthorizedTodo(
    request,
    params.todoId,
  )

  const { toTodoId } = (await request.json()) as { toTodoId?: string }
  if (!toTodoId) {
    throw new Response('Bad Request.', { status: 400 })
  }

  const toTodo = await getTodo(toTodoId)
  if (toTodo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const updatedTodo = await setTodoPosition(fromTodo.id, toTodo.position)

  return Response.json({ todo: updatedTodo })
}
