import { dataWithSuccess } from 'remix-toast'
import * as zod from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { TaskStatus, UpdateTaskModel } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'
import type { Route } from './+types/api.todo'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const task = await getTask(params.todoId || '')
  if (task.accountId !== loginInfo.account.id) throw new Error('erorr')

  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: zod.object({
      status: zod
        .preprocess((v) => Number(v), zod.nativeEnum(TaskStatus))
        .optional(),
      dueDate: zod.date().optional(),
      dueDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
    }),
  })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
  }

  const data = submission.value

  let toastMsg = ''
  const values: UpdateTaskModel = { id: task.id }
  if (data.status !== undefined) {
    values.status = data.status
    toastMsg = 'task.message.changed_status'
  }
  if (data.dueDate !== undefined) {
    values.due_date = data.dueDate?.toISOString() || null
    values.due_date_all_day = !!data.dueDateAllDay
  }

  const updatedTask = await updateTask(values)

  return dataWithSuccess({ task: updatedTask }, toastMsg)
}
