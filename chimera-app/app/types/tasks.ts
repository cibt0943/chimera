import * as zod from 'zod'
import type { Database } from '~/types/schema'
import type { ViewTodo } from '~/types/view-todos'

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
export type InsertTaskModel = Omit<
  Database['public']['Tables']['tasks']['Insert'],
  'todo_id'
> // todo_idは自動生成されるため除外
export type UpdateTaskModel =
  Database['public']['Tables']['tasks']['Update'] & { id: string } // idを必須で上書き

export type Task = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  todoId: string
  position: number
  status: TaskStatus
  title: string
  memo: string
  dueDate: Date | null
  dueDateAllDay: boolean
}

export type Tasks = Task[]

/**
 * DBのview_todosから取得した ViewTodo を
 * アプリケーションで扱う Task 型に変換する
 */
export function ViewTodo2Task(viewTodo: ViewTodo): Task {
  return {
    id: viewTodo.todoId,
    createdAt: viewTodo.createdAt,
    updatedAt: viewTodo.updatedAt,
    accountId: viewTodo.accountId,
    todoId: viewTodo.todoId,
    position: viewTodo.position,
    status: viewTodo.status ?? TaskStatus.NEW,
    title: viewTodo.title,
    memo: viewTodo.memo ?? '',
    dueDate: viewTodo.dueDate,
    dueDateAllDay: viewTodo.dueDateAllDay ?? false,
  }
}

export const TaskSchema = zod.object({
  status: zod.preprocess((v) => Number(v), zod.enum(TaskStatus)),
  title: zod
    .string({
      error: (issue) =>
        issue.input === undefined ? '必須項目です' : '入力値が不正です',
    })
    .max(255, { message: '255文字以内で入力してください' }),
  memo: zod.string().max(10000, '10000文字以内で入力してください').optional(),
  dueDate: zod.date().optional(),
  dueDateAllDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
})

export type TaskSchemaType = zod.infer<typeof TaskSchema>
