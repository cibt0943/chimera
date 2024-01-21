import { columns } from './todo-table-columns'
import { TodoTable } from './todo-table'
import { Tasks } from '~/types/tasks'

export function TodoContainer({ tasks }: { tasks: Tasks }) {
  return <TodoTable columns={columns} data={tasks} />
}
