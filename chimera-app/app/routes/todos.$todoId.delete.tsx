import { redirect } from '@remix-run/node'
import { TODO_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { getTask, deleteTask } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const task = await getTask(params.todoId || '')
    if (task.accountId !== loginSession.account.id) throw new Error('erorr')

    await deleteTask(task.id)

    const formData = await request.formData()
    const returnUrl = formData.get('returnUrl') as string | undefined
    return redirect(returnUrl || TODO_URL)
  },
)
