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
import type { Route } from './+types/todo'
import { TodoType } from '~/types/todos'
import { TaskSchema } from '~/types/tasks'
import { TodoBarSchema } from '~/types/todo-bars'

export function meta({ loaderData }: Route.MetaArgs) {
  return loaderData.todoType === TodoType.TASK
    ? [{ title: 'Task ' + loaderData.todoId + ' Edit | IMA' }]
    : [{ title: 'Todo Bar ' + loaderData.todoId + ' Edit | IMA' }]
}

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const todo = await getTodo(params.todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const formData = await request.formData()
  if (todo.type === TodoType.TASK) {
    const submission = parseWithZod(formData, { schema: TaskSchema })
    // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
    if (submission.status !== 'success') {
      throw new Response('Invalid submission data.', { status: 400 })
    }

    const data = submission.value
    const task = await getTaskFromTodoId(todo.id)

    await updateTask({
      id: task.id,
      status: data.status,
      title: data.title,
      memo: data.memo || '',
      due_date: data.dueDate?.toISOString() || null,
      due_date_all_day: !!data.dueDateAllDay,
    })
  } else if (todo.type === TodoType.BAR) {
    const submission = parseWithZod(formData, { schema: TodoBarSchema })
    if (submission.status !== 'success') {
      throw new Response('Invalid submission data.', { status: 400 })
    }

    const data = submission.value
    const todoBar = await getTodoBarFromTodoId(todo.id)

    await updateTodoBar({
      id: todoBar.id,
      title: data.title,
      color: data.color || '',
    })
  } else {
    throw new Response('Not Found', { status: 404 })
  }

  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL
  return redirect(redirectUrl)
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const todo = await getTodo(params.todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  if (todo.type === TodoType.TASK) {
    const task = await getTaskFromTodoId(todo.id)
    return { todoType: TodoType.TASK, todoId: todo.id, task }
  }

  if (todo.type === TodoType.BAR) {
    const todoBar = await getTodoBarFromTodoId(todo.id)
    return { todoType: TodoType.BAR, todoId: todo.id, todoBar }
  }

  throw new Response('Not Found', { status: 404 })
}

export default function Todo({ loaderData }: Route.ComponentProps) {
  const { todoType } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()
  const redirectUrl = TODO_URL

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
    navigate(redirectUrl)
  }

  if (todoType === TodoType.BAR) {
    return (
      <TodoBarFormDialog
        todoBar={loaderData.todoBar}
        isOpen={isOpenDialog}
        onOpenChange={onOpenChange}
        redirectUrl={redirectUrl}
      />
    )
  }

  return (
    <TaskFormDialog
      task={loaderData.task}
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
      redirectUrl={redirectUrl}
    />
  )
}
