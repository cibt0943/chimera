import { withAuthentication } from '~/lib/auth-middleware'
import { json } from '@remix-run/node'
import { getTask, changeTaskPosition } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const data = await request.json()
    const position = Number(data.position)
    // const data = await request.formData()
    // const position = Number(data.get('position'))

    if (!position) {
      return json({ error: 'position is required' }, { status: 422 })
    }

    const task = await getTask(Number(params.todoId))
    if (task.account_id !== account.id) throw new Error('erorr')

    const updatedTask = await changeTaskPosition(task.id, position)

    return json({ success: true, task: updatedTask })
  },
)
