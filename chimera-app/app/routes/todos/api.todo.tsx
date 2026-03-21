import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getTodo } from '~/models/todo.server'
import {
  getTaskFromTodoId,
  updateTask,
  UpdateTaskModel,
} from '~/models/task.server'
import { getTodoBarFromTodoId } from '~/models/todobar.server'
import { TodoType } from '~/types/todos'
import { TaskStatus } from '~/types/tasks'
import type { Route } from './+types/api.todo'

const updateTaskSchema = zod.object({
  status: zod.preprocess((v) => Number(v), zod.enum(TaskStatus)).optional(),
  dueDate: zod.preprocess((v) => new Date(String(v)), zod.date()).optional(),
  dueDateAllDay: zod.preprocess((v) => v === 'on', zod.boolean()).optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
})

async function requireAuthorizedTodo(request: Request, todoId: string) {
  const loginInfo = await isAuthenticated(request)
  const todo = await getTodo(todoId)
  if (todo.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { todo }
}

// タスクの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const { todo } = await requireAuthorizedTodo(request, params.todoId)

  switch (todo.type) {
    case TodoType.TASK: {
      const task = await getTaskFromTodoId(todo.id)
      const jsonData = await request.json()

      const submission = updateTaskSchema.safeParse(jsonData)
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

      return Response.json({ task: await updateTask(values) })
    }

    case TodoType.BAR: {
      return Response.json({ todoBar: await getTodoBarFromTodoId(todo.id) })
    }

    default:
      throw new Response('Not Found', { status: 404 })
  }
}
