import { redirectWithInfo } from 'remix-toast'
import { TODO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { deleteTaskFromTodoId } from '~/models/task.server'
import { deleteTodoBarFromTodoId } from '~/models/todobar.server'
import { getTodo } from '~/models/todo.server'
import type { Route } from './+types/todo.delete'
import { TodoType } from '~/types/todos'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const todo = await getTodo(params.todoId || '')
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  if (todo.type === TodoType.TASK) {
    await deleteTaskFromTodoId(todo.id)
  } else if (todo.type === TodoType.BAR) {
    await deleteTodoBarFromTodoId(todo.id)
  } else {
    throw new Response('Not Found', { status: 404 })
  }

  const formData = await request.formData()
  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL
  const message =
    todo.type === TodoType.BAR
      ? 'todoBar.message.deleted'
      : 'task.message.deleted'

  return redirectWithInfo(redirectUrl, message)
}
