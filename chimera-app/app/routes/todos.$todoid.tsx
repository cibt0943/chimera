import type {
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { parseWithZod } from '@conform-to/zod'
import { authenticator } from '~/lib/auth.server'
import { TaskSchema } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Todo ' + data?.id + ' | Kobushi' }]
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const user = await authenticator.authenticate('auth0', request)

  const task = await getTask(Number(params.todoId))
  if (task.user_id !== user.id) throw new Error('erorr')

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: TaskSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    return json({ result: submission.reply(), shouldConfirm: false })
  }

  const data = submission.value

  await updateTask({
    id: task.id,
    title: data.title,
    memo: data.memo || '',
    status: data.status,
    due_date: data.dueDate?.toISOString() || null,
    user_id: user.id,
  })

  return redirect('/todos')
}

export async function loader({ params }: LoaderFunctionArgs) {
  return json({ id: await params.todoid })
}

export default function Todo() {
  const { id } = useLoaderData<typeof loader>()

  return <div>id: {id}</div>
}
