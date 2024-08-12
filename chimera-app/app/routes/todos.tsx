import { MetaFunction, redirect } from '@remix-run/node'
import { Outlet, useParams } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { TODO_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { Tasks, TaskSchema } from '~/types/tasks'
import { getTasks, insertTask } from '~/models/task.server'
import { ErrorView } from '~/components/lib/error-view'
import { TodoTable } from '~/components/todo/todo-table'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
  }

  const data = submission.value

  await insertTask({
    account_id: loginSession.account.id,
    status: data.status,
    title: data.title,
    memo: data.memo || '',
    due_date: data.dueDate?.toISOString() || null,
    due_date_all_day: !!data.dueDateAllDay,
  })

  return redirect(TODO_URL)
})

type LoaderData = {
  tasks: Tasks
}

export const loader = withAuthentication(async ({ loginSession }) => {
  const tasks = await getTasks(loginSession.account.id)
  return typedjson({ tasks })
})

export default function Layout() {
  const { tasks } = useTypedLoaderData<LoaderData>()

  const params = useParams()
  const { todoId } = params

  return (
    <div className="p-4">
      <TodoTable defaultTasks={tasks} showId={todoId || ''} />
      <Outlet />
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
