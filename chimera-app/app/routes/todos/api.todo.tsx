import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { TaskStatus } from '~/types/tasks'
import { getTodo } from '~/models/todo.server'
import {
  getTaskFromTodoId,
  updateTask,
  UpdateTaskModel,
} from '~/models/task.server'
import { getTodoBarFromTodoId } from '~/models/todobar.server'
import type { Route } from './+types/api.todo'
import { TodoType } from '~/types/todos'

// タスクの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const todo = await getTodo(params.todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  if (todo.type === TodoType.TASK) {
    const task = await getTaskFromTodoId(todo.id)

    const jsonData = await request.json()

    const scheme = zod.object({
      status: zod.preprocess((v) => Number(v), zod.enum(TaskStatus)).optional(),
      dueDate: zod
        .preprocess((v) => new Date(String(v)), zod.date())
        .optional(),
      dueDateAllDay: zod
        .preprocess((v) => v === 'on', zod.boolean())
        .optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
    })

    const submission = scheme.safeParse(jsonData)

    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (!submission.success) {
      throw new Response('Invalid submission data.', { status: 400 })
    }

    const values: UpdateTaskModel = { id: task.id }

    const data = submission.data
    if (data.status !== undefined) {
      values.status = data.status
    }

    if (data.dueDate !== undefined) {
      values.due_date = data.dueDate?.toISOString() || null
      values.due_date_all_day = !!data.dueDateAllDay
    }

    const updatedTask = await updateTask(values)

    return Response.json({ task: updatedTask })
  } else {
    const todoBar = await getTodoBarFromTodoId(todo.id)

    return Response.json({ todoBar })
  }
}
