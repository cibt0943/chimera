import * as z from 'zod'

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
  { value: TaskStatus.DONE, label: 'done' },
  { value: TaskStatus.DOING, label: 'doing' },
  { value: TaskStatus.CANCELED, label: 'canceled' },
  { value: TaskStatus.PENDING, label: 'pending' },
]

export type TaskStatuses = TaskStatus[]

export type Task = {
  id: number
  title: string
  memo: string
  status: TaskStatus
  dueDate: string | null
  updated_at: string
}

export type Tasks = Task[]

export type TaskFormObj = {
  id: number
  title: string
  memo: string
  status: TaskStatus
  dueDate: Date | null
}

export type TaskModel = {
  id: number
  title: string
  memo: string
  status: number
  due_date: string | null
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
    dueDate: taskModel.due_date,
    updated_at: taskModel.updated_at,
  }
}

export const TaskSchema = z.object({
  title: z.string().min(1, { message: '必須項目です' }).max(255, {
    message: '255文字以内で入力してください',
  }),
  memo: z.string().max(10000, {
    message: '10000文字以内で入力してください',
  }),
  dueDate: z.date().nullable(),
})

export type TaskSchemaType = z.infer<typeof TaskSchema>
