import * as React from 'react'
import { redirect, useNavigate } from 'react-router'
import { parseWithZod } from '@conform-to/zod/v4'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { addTodoBar } from '~/models/todobar.server'
import { TodoBarFormDialog } from '~/components/todo/todo-bar-form-dialog'
import type { Route } from './+types/index'
import { TodoBarSchema } from '~/types/todo-bars'

export function meta() {
  return [{ title: 'Todo Bar Add | IMA' }]
}

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const formData = await request.formData()

  const submission = parseWithZod(formData, { schema: TodoBarSchema })

  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response(JSON.stringify(submission.error), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const data = submission.value

  await addTodoBar({
    account_id: loginInfo.account.id,
    todo_id: '',
    title: data.title,
    color: data.color || '',
  })

  const redirectUrl = (formData.get('redirectUrl') as string) || TODO_URL
  return redirect(redirectUrl)
}

export async function loader({ request }: Route.LoaderArgs) {
  await isAuthenticated(request)
  return {}
}

export default function TaskCreate() {
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const navigate = useNavigate()
  const redirectUrl = TODO_URL

  const onOpenChange = async (open: boolean) => {
    setIsOpenDialog(open)
    if (open) return
    await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
    navigate(redirectUrl)
  }

  return (
    <TodoBarFormDialog
      todoBar={undefined}
      isOpen={isOpenDialog}
      onOpenChange={onOpenChange}
      redirectUrl={redirectUrl}
    />
  )
}
