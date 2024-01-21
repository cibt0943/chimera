import * as z from 'zod'

export type TaskModel = {
  id: number
  title: string
  memo: string
  status: number
  dueDate: Date | null
  user_id: number
  created_at: Date
  updated_at: Date
}

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
  dueDate: Date | null
}

export type Tasks = Task[]

export type TaskFormData = {
  id?: number
  title?: string
  memo?: string
  status?: TaskStatus
  dueDate?: Date | null
}

export const createTask = (task?: Task): Task => ({
  id: task?.id || -1,
  title: task?.title || '',
  memo: task?.memo || '',
  dueDate: task?.dueDate || null,
  status: task?.status || TaskStatus.NEW,
})

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
