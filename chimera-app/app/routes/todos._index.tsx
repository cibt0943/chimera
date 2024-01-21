import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { authenticator } from '~/lib/auth.server'
import { Task, Tasks, TaskStatus } from '~/types/tasks'
import { getTasks } from '~/models/task.server'
import { TodoContainer } from '~/components/todo/todo-container'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  const taskModels = await getTasks(user.id)
  const tasks = taskModels.map<Task>((value) => {
    return {
      id: value.id,
      title: value.title,
      memo: value.memo,
      status: value.status as TaskStatus,
      dueDate: value.dueDate,
    }
  })

  return json({ tasks })
}

export default function Index() {
  const { tasks } = useLoaderData<typeof loader>() as { tasks: Tasks }

  return <TodoContainer tasks={tasks} />
}
