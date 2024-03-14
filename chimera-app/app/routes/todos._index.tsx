import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { parseWithZod } from '@conform-to/zod'
import { authenticator } from '~/lib/auth.server'
import {
  Task,
  Tasks,
  TaskModel2Task,
  TaskSchema,
  TaskStatus,
} from '~/types/tasks'
import { getTasks, insertTask } from '~/models/task.server'
import { TodoContainer } from '~/components/todo/todo-container'

export const meta: MetaFunction = () => {
  return [{ title: 'Todos | Kobushi' }]
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    return json({ result: submission.reply(), shouldConfirm: false })
    // return json({ success: false, message: "error!", submission });
    // return submission.reply()
  }

  const data = submission.value

  const insertModel = {
    title: data.title,
    memo: data.memo,
    status: TaskStatus.NEW,
    due_date: data.dueDate,
    user_id: user.id,
  }
  insertTask(insertModel)
  // return json(data)
  return redirect('/todos')
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
