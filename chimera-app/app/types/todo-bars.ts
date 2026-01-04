import * as zod from 'zod'
import { Todo } from '~/types/todos'

export type TodoBar = Todo & {
  todoId: string
  title: string
  color: string
}

export type TodoBars = TodoBar[]

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
