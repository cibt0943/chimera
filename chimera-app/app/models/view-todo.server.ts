import { format, toDate } from 'date-fns'
import type { Database } from '~/types/schema'
import { TaskStatus } from '~/types/tasks'
import { TodoType } from '~/types/todos'
import { ViewTodo, ViewTodos } from '~/types/view-todos'
import { supabase } from '~/lib/supabase-client.server'

// DBのViewTodoテーブルの型
export type ViewTodoModel = Database['public']['Views']['view_todos']['Row']

interface GetViewTodosOptionParams {
  dueDateStart?: Date
  dueDateEnd?: Date
}

// ViewTodo一覧を取得
export async function getViewTodos(
  accountId: string,
  options?: GetViewTodosOptionParams,
): Promise<ViewTodos> {
  const { dueDateStart, dueDateEnd } = options || {}

  let query = supabase
    .from('view_todos')
    .select()
    .eq('account_id', accountId)
    .order('position', { ascending: false })

  if (dueDateStart) {
    query = query.gt('due_date', format(dueDateStart, 'yyyy-MM-dd'))
  }

  if (dueDateEnd) {
    query = query.lt('due_date', format(dueDateEnd, 'yyyy-MM-dd'))
  }

  const { data, error } = await query
  if (error) throw error

  const todos = data.map((viewTodoModel) => {
    return convertToViewTodo(viewTodoModel)
  })

  return todos
}

// ViewTodoを取得
export async function getViewTodo(todoId: string): Promise<ViewTodo> {
  const { data, error } = await supabase
    .from('view_todos')
    .select()
    .eq('todo_id', todoId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return convertToViewTodo(data)
}

// ViewTodoModelをViewTodo型に変換
export function convertToViewTodo(viewTodoModel: ViewTodoModel): ViewTodo {
  return {
    todoId: viewTodoModel.todo_id,
    createdAt: toDate(viewTodoModel.created_at),
    updatedAt: toDate(viewTodoModel.updated_at),
    accountId: viewTodoModel.account_id,
    type: viewTodoModel.type as TodoType,
    position: viewTodoModel.position,
    title: viewTodoModel.title,
    status: viewTodoModel.status as TaskStatus,
    memo: viewTodoModel.memo,
    dueDate: viewTodoModel.due_date ? toDate(viewTodoModel.due_date) : null,
    dueDateAllDay: viewTodoModel.due_date_all_day,
    color: viewTodoModel.color,
  }
}
