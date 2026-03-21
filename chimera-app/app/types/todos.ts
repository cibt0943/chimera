import * as zod from 'zod'

export const TodoType = {
  TASK: 1,
  BAR: 2,
} as const
export type TodoType = (typeof TodoType)[keyof typeof TodoType]

export type Todo = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  type: TodoType
  position: number
}

export type Todos = Todo[]

export const TodoSchema = zod.object({
  type: zod.preprocess((v) => Number(v), zod.enum(TodoType)),
})

export type TodoSchemaType = zod.infer<typeof TodoSchema>
