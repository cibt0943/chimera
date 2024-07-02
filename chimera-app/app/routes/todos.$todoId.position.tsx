import { withAuthentication } from '~/lib/auth-middleware'
import { json } from '@remix-run/node'
import { getTask, updateTaskPosition } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const fromTask = await getTask(params.todoId || '')
    if (!fromTask || fromTask.account_id !== account.id)
      throw new Error('erorr')

    const data = await request.json()
    const toTaskId = data.toTaskId
    const toTask = await getTask(toTaskId)
    if (!toTask || toTask.account_id !== account.id) throw new Error('erorr')

    const updatedTask = await updateTaskPosition(fromTask.id, toTask.position)

    return json({ success: true, task: updatedTask })
  },
)
