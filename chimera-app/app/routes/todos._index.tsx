import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { authenticator } from '~/lib/auth.server'
import { Task, Tasks, TaskModel2Task } from '~/types/tasks'
import { getTasks } from '~/models/task.server'
import { TodoContainer } from '~/components/todo/todo-container'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  const taskModels = await getTasks(user.id)
  return json({ taskModels })
}

export default function Index() {
  const { taskModels } = useLoaderData<typeof loader>()

  const tasks: Tasks = taskModels.map<Task>((value) => {
    return TaskModel2Task(value)
  })

  return <TodoContainer tasks={tasks} />
}
