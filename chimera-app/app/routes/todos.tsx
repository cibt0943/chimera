import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { Task, TaskModels, TaskModel2Task, TaskSchema } from '~/types/tasks'
import { getTasks, insertTask } from '~/models/task.server'
import { ErrorView } from '~/components/lib/error-view'
import { TodoTable } from '~/components/todo/todo-table'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export const action = withAuthentication(async ({ request, account }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
    // return json({ result: submission.reply() }, { status: 422 })
  }

  const data = submission.value

  await insertTask({
    title: data.title,
    memo: data.memo || '',
    status: data.status,
    due_date: data.due_date?.toISOString() || null,
    account_id: account.id,
  })

  return redirect('/todos')
})

type LoaderData = {
  taskModels: TaskModels
}

export const loader = withAuthentication(async ({ account }) => {
  const taskModels = await getTasks(account.id)
  return json({ taskModels })
})

export default function Layout() {
  const { taskModels } = useLoaderData<LoaderData>()
  const tasks = taskModels.map<Task>((value) => {
    return TaskModel2Task(value)
  })

  return (
    <div className="p-4">
      <ClientOnly>{() => <TodoTable tasks={tasks} />}</ClientOnly>
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
