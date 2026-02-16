import { TodoType } from '~/types/todos'
import { TaskStatus } from '~/types/tasks'

export type ViewTodo = {
  todoId: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  type: TodoType
  position: number
  title: string
  status: TaskStatus | null
  memo: string | null
  dueDate: Date | null
  dueDateAllDay: boolean | null
  bgColor: string | null
  textColor: string | null
}

export type ViewTodos = ViewTodo[]
