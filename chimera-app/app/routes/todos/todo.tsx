import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTodo } from '~/models/todo.server'
import { getTaskFromTodoId, updateTask } from '~/models/task.server'
import { getTodoBarFromTodoId, updateTodoBar } from '~/models/todobar.server'
import { TaskFormDialog } from '~/components/todo/task-form-dialog'
import { TodoBarFormDialog } from '~/components/todo/todo-bar-form-dialog'
import { TodoType } from '~/types/todos'
import { TaskSchema } from '~/types/tasks'
import { TodoBarSchema } from '~/types/todo-bars'
import type { Route } from './+types/todo'

export function meta({ loaderData }: Route.MetaArgs) {
  const prefix = loaderData.todoType === TodoType.TASK ? 'Task' : 'Todo Bar'
  return [{ title: `${prefix} ${loaderData.todoId} Edit | IMA` }]
}

async function requireAuthorizedTodo(request: Request, todoId: string) {
  const loginInfo = await isAuthenticated(request)
  const todo = await getTodo(loginInfo.account.id, todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }
  return { loginInfo, todo }
}

// クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
async function handleTaskAction(
  accountId: string,
  todoId: string,
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: TaskSchema })
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const { status, title, memo, dueDate, dueDateAllDay } = submission.value
  const task = await getTaskFromTodoId(accountId, todoId)

  await updateTask({
    id: task.id,
    account_id: task.accountId,
    status,
    title,
    memo: memo ?? '',
    due_date: dueDate?.toISOString() ?? null,
    due_date_all_day: !!dueDateAllDay,
  })
}

async function handleTodoBarAction(
  accountId: string,
  todoId: string,
  formData: FormData,
) {
  const submission = parseWithZod(formData, { schema: TodoBarSchema })
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const { title, bgColor, textColor } = submission.value
  const todoBar = await getTodoBarFromTodoId(accountId, todoId)

  await updateTodoBar({
    id: todoBar.id,
    account_id: todoBar.accountId,
    title,
    bg_color: bgColor ?? '',
    text_color: textColor ?? '',
  })
}

export async function action({ params, request }: Route.ActionArgs) {
  const { loginInfo, todo } = await requireAuthorizedTodo(
    request,
    params.todoId,
  )

  const formData = await request.formData()

  switch (todo.type) {
    case TodoType.TASK:
      await handleTaskAction(loginInfo.account.id, todo.id, formData)
      break
    case TodoType.BAR:
      await handleTodoBarAction(loginInfo.account.id, todo.id, formData)
      break
    default:
      throw new Response('Not Found', { status: 404 })
  }

  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL
  return redirect(redirectUrl)
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { todo, loginInfo } = await requireAuthorizedTodo(
    request,
    params.todoId,
  )

  switch (todo.type) {
    case TodoType.TASK: {
      const task = await getTaskFromTodoId(loginInfo.account.id, todo.id)
      return { todoType: TodoType.TASK, todoId: todo.id, task }
    }
    case TodoType.BAR: {
      const todoBar = await getTodoBarFromTodoId(loginInfo.account.id, todo.id)
      return { todoType: TodoType.BAR, todoId: todo.id, todoBar }
    }
    default:
      throw new Response('Not Found', { status: 404 })
  }
}

export default function Todo({ loaderData }: Route.ComponentProps) {
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()
  const redirectUrl = TODO_URL

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
    navigate(redirectUrl)
  }

  switch (loaderData.todoType) {
    case TodoType.BAR:
      return (
        <TodoBarFormDialog
          todoBar={loaderData.todoBar}
          isOpen={isOpenDialog}
          onOpenChange={onOpenChange}
          redirectUrl={redirectUrl}
        />
      )
    case TodoType.TASK:
      return (
        <TaskFormDialog
          task={loaderData.task}
          isOpen={isOpenDialog}
          onOpenChange={onOpenChange}
          redirectUrl={redirectUrl}
        />
      )
    default:
      return null
  }
}
