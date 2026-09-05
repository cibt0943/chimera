import * as zod from 'zod'
import type { Todo } from '~/types/todos'

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
  },
  {
    value: TaskStatus.DOING,
    label: 'task.model.status_list.doing',
    dispOrder: 1,
    color: 'bg-indigo-800',
  },
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

export type Task = Todo & {
  todoId: string
  status: TaskStatus
  title: string
  memo: string
  dueDate: Date | null
  dueDateAllDay: boolean
}

export type Tasks = Task[]

export const TaskSchema = zod.object({
  status: zod.coerce
    .number()
    .pipe(zod.enum(TaskStatus, 'common.validation.invalid')),
  title: zod
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'common.validation.required'
          : 'common.validation.invalid',
    })
    .max(255, 'common.validation.max_length_255'),
  memo: zod
    .string()
    .max(10000, 'common.validation.max_length_10000')
    .optional(),
  dueDate: zod.date().optional(),
  dueDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
})

export type TaskSchemaType = zod.infer<typeof TaskSchema>
