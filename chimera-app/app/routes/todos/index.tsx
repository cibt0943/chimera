import { useParams, Outlet, redirect } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { TODO_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { insertTask } from '~/models/task.server'
import { getTodos } from '~/models/todo.server'
import { TodoTable } from '~/components/todo/todo-table'
import type { Route } from './+types/index'
import { TaskSchema } from '~/types/tasks'

export function meta() {
  return [{ title: 'Todos | IMA' }]
}

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  await insertTask({
    account_id: loginInfo.account.id,
    status: data.status,
    title: data.title,
    memo: data.memo || '',
    due_date: data.dueDate?.toISOString() || null,
    due_date_all_day: !!data.dueDateAllDay,
  })

  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL
  return redirect(redirectUrl)
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const todos = await getTodos(loginInfo.account.id)
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
