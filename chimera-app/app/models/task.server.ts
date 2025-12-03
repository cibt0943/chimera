import { format } from 'date-fns'
import {
  Task,
  InsertTaskModel,
  UpdateTaskModel,
  mergeTaskModel,
} from '~/types/tasks'
import { TodoType, TodoModel2Todo, TodoModel } from '~/types/todos'
import { supabase } from '~/lib/supabase-client.server'
import { addTodo } from '~/models/todo.server'

// タスクの追加
export async function addTask(
  task: Omit<InsertTaskModel, 'todo_id'>,
): Promise<Task> {
  const newTodo = await addTodo({
    account_id: task.account_id,
    type: TodoType.TASK,
  })

  // タスクの表示位置を計算
  const { data: newTask, error: errorNewTask } = await supabase
    .from('tasks')
    .insert({ ...task, todo_id: newTodo.id })
    .select()
    .single()
  if (errorNewTask || !newTask) throw errorNewTask || new Error('error')

  return mergeTaskModel(newTodo, newTask)
}

// タスクの取得
export async function getTask(taskId: string): Promise<Task> {
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select()
    .eq('id', taskId)
    .single()
  if (taskError || !taskData) throw taskError || new Error('error')

  const { data: todoData, error: todoError } = await supabase
    .from('todos')
    .select()
    .eq('id', taskData.todo_id)
    .single()
  if (todoError || !todoData) throw todoError || new Error('error')

  return mergeTaskModel(TodoModel2Todo(todoData), taskData)
}

// タスクの一覧取得
interface GetTasksOptionParams {
  dueDateStart?: Date
  dueDateEnd?: Date
}

export async function getTasks(
  accountId: string,
  options?: GetTasksOptionParams,
): Promise<Task[]> {
  const { dueDateStart, dueDateEnd } = options || {}

  let query = supabase
    .from('tasks')
    .select()
    .eq('account_id', accountId)

  if (dueDateStart) {
    query = query.gte('due_date', format(dueDateStart, 'yyyy-MM-dd'))
  }

  if (dueDateEnd) {
    query = query.lte('due_date', format(dueDateEnd, 'yyyy-MM-dd'))
  }

  const { data: tasks, error } = await query
  if (error) throw error
  if (!tasks) return []

  // Fetch all corresponding todos
  const todoIds = [...new Set(tasks.map((task) => task.todo_id))]
  const { data: todos, error: todoError } = await supabase
    .from('todos')
    .select()
    .in('id', todoIds)
  if (todoError) throw todoError

  // Create a map of todos by id for quick lookup
  const todoMap = new Map(todos.map((todo) => [todo.id, TodoModel2Todo(todo)]))

  // Merge tasks with their corresponding todos
  return tasks.map((task) => {
    const todo = todoMap.get(task.todo_id)
    if (!todo) throw new Error(`Todo not found for task ${task.id}`)
    return mergeTaskModel(todo, task)
  })
}

// タスクの更新
export async function updateTask(
  task: UpdateTaskModel,
  noUpdated = false,
): Promise<Task> {
  if (!noUpdated) task.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('error')

  // Fetch the corresponding todo to get position information
  const { data: todoData, error: todoError } = await supabase
    .from('todos')
    .select()
    .eq('id', data.todo_id)
    .single()
  if (todoError || !todoData) throw todoError || new Error('error')

  return mergeTaskModel(TodoModel2Todo(todoData), data)
}

// タスクの削除
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

// タスクの位置を変更
// taskIdにて指定されたタスクの位置をpositionに変更します。
// この変更による他のタスクの位置の変更もあわせて行います。
export async function updateTaskPosition(
  taskId: string,
  position: number,
): Promise<Task> {
  const fromTask = await getTask(taskId)

  const isUp = fromTask.position < position
  const [fromOperator, toOperator] = isUp ? ['gt', 'lte'] : ['lt', 'gte']

  // Get todos that need position adjustment
  const { data: todosToUpdate, error: errorTodosToUpdate } = await supabase
    .from('todos')
    .select()
    .filter('position', fromOperator, fromTask.position)
    .filter('position', toOperator, position)
    .order('position')
  if (errorTodosToUpdate) throw errorTodosToUpdate

  // Update positions of todos in between
  await updateTodosPosition(todosToUpdate, isUp)

  // Update the moved todo's position
  const { error: updateError } = await supabase
    .from('todos')
    .update({ position })
    .eq('id', fromTask.todoId)
  if (updateError) throw updateError

  // Return the updated task
  return await getTask(taskId)
}

async function updateTodosPosition(todosToUpdate: TodoModel[], isUp: boolean) {
  const updatedTodos = todosToUpdate.map((todo) => ({
    ...todo,
    position: isUp ? todo.position - 1 : todo.position + 1,
  }))

  const { error } = await supabase
    .from('todos')
    .upsert(updatedTodos, { onConflict: 'id' })
  if (error) throw error
}

// Alias for addTask for backward compatibility
export const insertTask = addTask
