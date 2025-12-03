import { format } from 'date-fns'
import {
  Task,
  TaskModel,
  InsertTaskModel,
  UpdateTaskModel,
  mergeTaskModel,
} from '~/types/tasks'
import { TodoType } from '~/types/todos'
import { supabase } from '~/lib/supabase-client.server'
import { addTodo } from '~/models/todo.server'

// タスクの追加
export async function addTask(task: InsertTaskModel): Promise<Task> {
  const newTodo = await addTodo({
    account_id: task.account_id,
    type: TodoType.TASK,
  })

  // タスクの表示位置を計算
  const { data: newTask, error: errorNewTask } = await supabase
    .from('tasks')
    .insert({ ...task })
    .select()
    .single()
  if (errorNewTask || !newTask) throw errorNewTask || new Error('erorr')

  return mergeTaskModel(newTodo, newTask)
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
  if (error || !data) throw error || new Error('erorr')

  return mergeTaskModel(task, data)
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

  const { data: tasksToUpdate, error: errorTasksToUpdate } = await supabase
    .from('tasks')
    .select()
    .filter('position', fromOperator, fromTask.position)
    .filter('position', toOperator, position)
    .order('position')
  if (errorTasksToUpdate) throw errorTasksToUpdate

  // 間のタスクの位置を変更
  await updateTasksPosition(tasksToUpdate, isUp)
  // 移動するタスクの位置を変更
  return await updateTask({
    id: fromTask.id,
    position,
  })
}

async function updateTasksPosition(tasksToUpdate: TaskModel[], isUp: boolean) {
  const updatedTasks = tasksToUpdate.map((task) => ({
    ...task,
    position: isUp ? task.position - 1 : task.position + 1,
  }))

  const { error } = await supabase
    .from('tasks')
    .upsert(updatedTasks, { onConflict: 'id' })
  if (error) throw error
}
