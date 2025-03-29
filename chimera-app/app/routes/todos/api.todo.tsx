import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { TaskStatus, UpdateTaskModel } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'
import type { Route } from './+types/api.todo'

// タスクの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const jsonData = await request.json()

  const scheme = zod.object({
    status: zod
      .preprocess((v) => Number(v), zod.nativeEnum(TaskStatus))
      .optional(),
    dueDate: zod.preprocess((v) => new Date(String(v)), zod.date()).optional(),
    dueDateAllDay: zod.preprocess((v) => v === 'on', zod.boolean()).optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
  })

  const submission = scheme.safeParse(jsonData)

  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (!submission.success) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.data

  const values: UpdateTaskModel = { id: task.id }

  if (data.status !== undefined) {
    values.status = data.status
  }

  if (data.dueDate !== undefined) {
    values.due_date = data.dueDate?.toISOString() || null
    values.due_date_all_day = !!data.dueDateAllDay
  }

  const updatedTask = await updateTask(values)

  return Response.json({ task: updatedTask })
}
