import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'

// DBのTodoBarテーブルの型
export type TodoBarModel = Database['public']['Tables']['todo_bars']['Row']
export type InsertTodoBarModel =
  Database['public']['Tables']['todo_bars']['Insert']
export type UpdateTodoBarModel =
  Database['public']['Tables']['todo_bars']['Update'] & { id: string } // idを必須で上書き

export type TodoBar = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  todoId: string
  title: string
  color: string
}

export type TodoBars = TodoBar[]

export function TodoBarModel2TodoBar(todoBarModel: TodoBarModel): TodoBar {
  return {
    id: todoBarModel.id,
    createdAt: toDate(todoBarModel.created_at),
    updatedAt: toDate(todoBarModel.updated_at),
    accountId: todoBarModel.account_id,
    todoId: todoBarModel.todo_id,
    title: todoBarModel.title,
    color: todoBarModel.color,
  }
}

export const TodoBarSchema = zod.object({
  title: zod
    .string({
      error: (issue) =>
        issue.input === undefined ? '必須項目です' : '入力値が不正です',
    })
    .max(255, { message: '255文字以内で入力してください' }),
  color: zod.string().max(10, '10文字以内で入力してください').optional(),
})

export type TodoBarSchemaType = zod.infer<typeof TodoBarSchema>
