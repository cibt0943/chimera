import { redirectWithInfo } from 'remix-toast'
import { TODO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { deleteTaskFromTodoId } from '~/models/task.server'
import { deleteTodoBarFromTodoId } from '~/models/todobar.server'
import { getTodo } from '~/models/todo.server'
import { TodoType } from '~/types/todos'
import type { Route } from './+types/todo.delete'

async function requireAuthorizedTodo(request: Request, todoId: string) {
  const loginInfo = await isAuthenticated(request)
  const todo = await getTodo(loginInfo.account.id, todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { loginInfo, todo }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { loginInfo, todo } = await requireAuthorizedTodo(
    request,
    params.todoId,
  )

  const formData = await request.formData()
  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL

  switch (todo.type) {
    case TodoType.TASK:
      await deleteTaskFromTodoId(loginInfo.account.id, todo.id)
      return redirectWithInfo(redirectUrl, 'task.message.deleted')

    case TodoType.BAR:
      await deleteTodoBarFromTodoId(loginInfo.account.id, todo.id)
      return redirectWithInfo(redirectUrl, 'todoBar.message.deleted')

    default:
      throw new Response('Not Found', { status: 404 })
  }
}
