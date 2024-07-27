import { withAuthentication } from '~/lib/auth-middleware'
import { json } from '@remix-run/node'
import { getTask, updateTaskPosition } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const fromTask = await getTask(params.todoId || '')
    if (fromTask.accountId !== loginSession.account.id) throw new Error('erorr')

    const data = await request.json()
    const toTask = await getTask(data.toTaskId)
    if (toTask.accountId !== loginSession.account.id) throw new Error('erorr')

    const updatedTask = await updateTaskPosition(fromTask.id, toTask.position)

    return json({ success: true, task: updatedTask })
  },
)
