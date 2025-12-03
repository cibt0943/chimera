import { toDate } from 'date-fns'
import type { Database } from '~/types/schema'
import { TodoType } from '~/types/todos'
import { TaskStatus } from '~/types/tasks'

// DBのタスクテーブルの型
export type ViewTodoModel = Database['public']['Views']['view_todos']['Row']

export type ViewTodo = {
  id: string // Alias for todoId for backward compatibility
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
  color: string | null
}

export type ViewTodos = ViewTodo[]

export function ViewTodoModel2ViewTodo(viewTodoModel: ViewTodoModel): ViewTodo {
  const todoId = viewTodoModel.todo_id || ''
  return {
    id: todoId, // Alias for todoId for backward compatibility
    todoId,
    createdAt: toDate(viewTodoModel.created_at),
    updatedAt: toDate(viewTodoModel.updated_at),
    accountId: viewTodoModel.account_id,
    type: viewTodoModel.type as TodoType,
    position: viewTodoModel.position,
    title: viewTodoModel.title || '',
    status: viewTodoModel.status as TaskStatus,
    memo: viewTodoModel.memo,
    dueDate: viewTodoModel.due_date ? toDate(viewTodoModel.due_date) : null,
    dueDateAllDay: viewTodoModel.due_date_all_day,
    color: viewTodoModel.color,
  }
}
