import * as zod from 'zod'
import { redirect } from '@remix-run/node'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { TaskStatus } from '~/types/tasks'
import { getTask, updateTask } from '~/models/task.server'

export const action = withAuthentication(
  async ({ params, request, account }) => {
    const task = await getTask(Number(params.todoId))
    if (task.account_id !== account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, {
      schema: zod.object({
        status: zod.preprocess((v) => Number(v), zod.nativeEnum(TaskStatus)),
      }),
    })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      throw new Error('Invalid submission data.')
    }

    const data = submission.value

    await updateTask({
      id: task.id,
      status: data.status,
    })

    return redirect('/todos')
  },
)
