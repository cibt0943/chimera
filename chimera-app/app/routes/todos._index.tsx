import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getValidatedFormData } from 'remix-hook-form'
import { authenticator } from '~/lib/auth.server'
import {
  Task,
  Tasks,
  TaskModel2Task,
  TaskSchemaType,
  taskResolver,
  TaskStatus,
} from '~/types/tasks'
import { getTasks, insertTask } from '~/models/task.server'
import { TodoContainer } from '~/components/todo/todo-container'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    errors,
    data,
    receivedValues: defaultValues,
  } = await getValidatedFormData<TaskSchemaType>(request, taskResolver)
  const user = await authenticator.authenticate('auth0', request)
  if (errors) {
    return json({ errors, defaultValues })
  }

  const insertModel = {
    title: data.title,
    memo: data.memo,
    status: TaskStatus.NEW,
    due_date: data.dueDate,
    user_id: user.id,
  }

  insertTask(insertModel)
  return json(data)
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
