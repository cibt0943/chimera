import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'

export const TaskStatus = {
  NEW: 0,
  DONE: 1,
  DOING: 2,
  PENDING: 3,
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

// タスクの全状態の値順リスト
export const TaskStatusList = [
  {
    value: TaskStatus.NEW,
    label: 'task.model.status_list.new',
    dispOrder: 0,
    color: '',
  },
  {
    value: TaskStatus.DONE,
    label: 'task.model.status_list.done',
    dispOrder: 2,
    color: 'bg-violet-600',
  }, //bg-orange-500
  {
    value: TaskStatus.DOING,
    label: 'task.model.status_list.doing',
    dispOrder: 1,
    color: 'bg-indigo-800',
  }, //bg-violet-600
  {
    value: TaskStatus.PENDING,
    label: 'task.model.status_list.pending',
    dispOrder: 3,
    color: 'bg-gray-500',
  },
]

// タスクの全状態の表示順リスト
export const TaskStatusListByDispOrder = TaskStatusList.slice().sort(
  (a, b) => a.dispOrder - b.dispOrder,
)

// DBのタスクテーブルの型
export type TaskModel = Database['public']['Tables']['tasks']['Row']
export type InsertTaskModel = Database['public']['Tables']['tasks']['Insert']
export type UpdateTaskModel =
  Database['public']['Tables']['tasks']['Update'] & { id: string } // idを必須で上書き

export type Task = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  status: TaskStatus
  position: number
  title: string
  memo: string
  dueDate: Date | null
  dueDateAllDay: boolean
}

export type Tasks = Task[]

export function TaskModel2Task(taskModel: TaskModel): Task {
  return {
    id: taskModel.id,
    createdAt: toDate(taskModel.created_at),
    updatedAt: toDate(taskModel.updated_at),
    accountId: taskModel.account_id,
    status: taskModel.status as TaskStatus,
    position: taskModel.position,
    title: taskModel.title,
    memo: taskModel.memo,
    dueDate: taskModel.due_date ? toDate(taskModel.due_date) : null,
    dueDateAllDay: taskModel.due_date_all_day,
  }
}

export const TaskSchema = zod.object({
  status: zod.preprocess((v) => Number(v), zod.nativeEnum(TaskStatus)),
  title: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  memo: zod.string().max(10000, '10000文字以内で入力してください').optional(),
  dueDate: zod.date().optional(),
  dueDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
  returnUrl: zod.string().optional(),
})

export type TaskSchemaType = zod.infer<typeof TaskSchema>
