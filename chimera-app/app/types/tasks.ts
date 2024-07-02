import * as zod from 'zod'
import { toDate } from 'date-fns'

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
    disp_order: 0,
    color: '',
  },
  {
    value: TaskStatus.DONE,
    label: 'task.model.status_list.done',
    disp_order: 2,
    color: 'bg-violet-600',
  }, //bg-orange-500
  {
    value: TaskStatus.DOING,
    label: 'task.model.status_list.doing',
    disp_order: 1,
    color: 'bg-indigo-800',
  }, //bg-violet-600
  {
    value: TaskStatus.PENDING,
    label: 'task.model.status_list.pending',
    disp_order: 4,
    color: 'bg-gray-500',
  },
]

// タスクの全状態の表示順リスト
export const TaskStatusListByDispOrder = TaskStatusList.slice().sort(
  (a, b) => a.disp_order - b.disp_order,
)

export type Task = {
  id: string
  title: string
  memo: string
  status: TaskStatus
  due_date: Date | null
  // position: number
  account_id: string
  created_at: Date
  updated_at: Date
}

export type Tasks = Task[]

export type TaskModel = {
  id: string
  title: string
  memo: string
  status: number
  due_date: string | null
  position: number
  account_id: string
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
    due_date: taskModel.due_date ? toDate(taskModel.due_date) : null,
    // position: taskModel.position,
    account_id: taskModel.account_id,
    created_at: toDate(taskModel.created_at),
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
  // due_date: zod.coerce.date().optional(),
  due_date: zod.date().optional(),
})

export type TaskSchemaType = zod.infer<typeof TaskSchema>
