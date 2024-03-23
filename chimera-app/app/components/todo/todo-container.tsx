import { ClientOnly } from 'remix-utils/client-only'
import { columns } from './todo-table-columns'
import { TodoTable } from './todo-table'
import { Tasks } from '~/types/tasks'

export function TodoContainer({ tasks }: { tasks: Tasks }) {
  return (
    <ClientOnly>
      {() => <TodoTable columns={columns} data={tasks} />}
    </ClientOnly>
  )
  // return <TodoTable columns={columns} data={tasks} />
}
