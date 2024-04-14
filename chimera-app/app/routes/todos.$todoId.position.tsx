import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'
import { getTask, changeTaskPosition } from '~/models/task.server'

export async function action({ params, request }: ActionFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  const data = await request.json()
  const position = Number(data.position)
  // const data = await request.formData()
  // const position = Number(data.get('position'))

  if (!position) {
    return json({ error: 'position is required' }, { status: 422 })
  }

  const task = await getTask(Number(params.todoId))
  if (task.user_id !== user.id) throw new Error('erorr')

  const updatedTask = await changeTaskPosition(task.id, position)

  return json({ success: true, task: updatedTask })
}
