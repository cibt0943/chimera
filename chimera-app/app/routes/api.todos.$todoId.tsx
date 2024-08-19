import { jsonWithSuccess } from 'remix-toast'
import * as zod from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { TaskStatus, UpdateTaskModel } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const task = await getTask(params.todoId || '')
    if (task.accountId !== loginSession.account.id) throw new Error('erorr')

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

    return jsonWithSuccess({ task: updatedTask }, toastMsg)
  },
)
