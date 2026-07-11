import * as zod from 'zod'
import { Todo } from '~/types/todos'

export type TodoBar = Todo & {
  todoId: string
  title: string
  bgColor: string
  textColor: string
}

export type TodoBars = TodoBar[]

export const TodoBarSchema = zod.object({
  title: zod
    .string({
      error: (issue) =>
        issue.input === undefined
          ? 'common.validation.required'
          : 'common.validation.invalid',
    })
    .max(255, 'common.validation.max_length_255'),
  bgColor: zod.string().max(10, 'common.validation.max_length_10').optional(),
  textColor: zod.string().max(10, 'common.validation.max_length_10').optional(),
})

export type TodoBarSchemaType = zod.infer<typeof TodoBarSchema>
