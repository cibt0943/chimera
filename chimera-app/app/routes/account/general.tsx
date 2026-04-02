import { redirectWithInfo } from 'remix-toast'
import { parseWithZod } from '@conform-to/zod/v4'
import { ACCOUNT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getAccount, updateAccount } from '~/models/account.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import type { Route } from './+types/general'
import { AccountGeneralSchema } from '~/types/accounts'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const account = await getAccount(loginInfo.account.id)
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: AccountGeneralSchema,
  })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.value

  // Auth0のユーザー情報を更新
  loginInfo.auth0User = await updateAuth0User({
    sub: account.sub,
    name: data.name,
  })

  // DBのアカウント情報を更新
  loginInfo.account = await updateAccount({
    id: account.id,
    language: data.language,
    timezone: account.timezone,
    theme: data.theme,
  })

  // ログインセッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set('loginInfo', loginInfo)

  return redirectWithInfo(
    `${ACCOUNT_URL}/settings`,
    'account.message.updated',
    {
      headers: {
        // 新しいセッション情報をクッキーとして設定するように指示
        'Set-Cookie': await commitSession(session),
      },
    },
  )
}
