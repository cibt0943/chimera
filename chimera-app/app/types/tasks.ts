import * as zod from 'zod'
import { toDate } from 'date-fns'

export const TaskStatus = {
  NEW: 0,
  DONE: 1,
  DOING: 2,
  CANCELED: 3,
  PENDING: 4,
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskStatusList = [
  { value: TaskStatus.NEW, label: 'new' },
  { value: TaskStatus.DOING, label: 'doing' },
  { value: TaskStatus.DONE, label: 'done' },
  { value: TaskStatus.CANCELED, label: 'canceled' },
  { value: TaskStatus.PENDING, label: 'pending' },
]

export type Task = {
  id: number
  title: string
  memo: string
  status: TaskStatus
  dueDate: Date | null
  position: number
  user_id: number
  updated_at: Date
}

export type Tasks = Task[]

export type TaskModel = {
  id: number
  title: string
  memo: string
  status: number
  due_date: string | null
  position: number
  user_id: number
  created_at: string
  updated_at: string
}

export type TaskModels = TaskModel[]

export function TaskModel2Task(taskModel: TaskModel): Task {
  return {
    id: taskModel.id,
    title: taskModel.title,
    memo: taskModel.memo,
    status: taskModel.status as TaskStatus,
    dueDate: taskModel.due_date ? toDate(taskModel.due_date) : null,
    position: taskModel.position,
    user_id: taskModel.user_id,
    updated_at: toDate(taskModel.updated_at),
  }
}

export const TaskSchema = zod.object({
  title: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  memo: zod.string().max(10000, '10000文字以内で入力してください').optional(),
  status: zod.preprocess((v) => Number(v), zod.nativeEnum(TaskStatus)),
  // status: zod.nativeEnum(TaskStatus),
  dueDate: zod.coerce.date().optional().nullable(),
})

export type TaskSchemaType = zod.infer<typeof TaskSchema>
