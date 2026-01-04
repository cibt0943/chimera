import { useParams, Outlet } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getViewTodos } from '~/models/view-todo.server'
import { TodoTable } from '~/components/todo/todo-table'
import type { Route } from './+types/index'

export function meta() {
  return [{ title: 'Todos | IMA' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const todos = await getViewTodos(loginInfo.account.id)
  return { todos }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { todos } = loaderData

  const params = useParams()
  const { todoId } = params

  return (
    <div className="p-4 pt-0 md:pt-4">
      <TodoTable originalTodos={todos} showId={todoId || ''} />
      <Outlet />
    </div>
  )
}
