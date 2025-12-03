import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'

export const TodoType = {
  TASK: 1,
  BAR: 2,
} as const
export type TodoType = (typeof TodoType)[keyof typeof TodoType]

// DBのタスクテーブルの型
export type TodoModel = Database['public']['Tables']['todos']['Row']
export type InsertTodoModel = Omit<
  Database['public']['Tables']['todos']['Insert'],
  'id'
> & { type: TodoType } // idを削除, typeを必須で上書き
export type UpdateTodoModel =
  Database['public']['Tables']['todos']['Update'] & { id: string } // idを必須で上書き

export type Todo = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  type: TodoType
  position: number
}

export type Todos = Todo[]

export function TodoModel2Todo(todoModel: TodoModel): Todo {
  return {
    id: todoModel.id,
    createdAt: toDate(todoModel.created_at),
    updatedAt: toDate(todoModel.updated_at),
    accountId: todoModel.account_id,
    type: todoModel.type as TodoType,
    position: todoModel.position,
  }
}

export const TodoSchema = zod.object({
  type: zod.preprocess((v) => Number(v), zod.enum(TodoType)),
})

export type TodoSchemaType = zod.infer<typeof TodoSchema>
