import { redirectWithSuccess } from 'remix-toast'
import { parseWithZod } from '@conform-to/zod'
import { ACCOUNT_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccount, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { AccountGeneralSchema } from '~/types/accounts'

export const action = withAuthentication(async ({ request, loginSession }) => {
  const account = await getAccount(loginSession.account.id)
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: AccountGeneralSchema,
  })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success')
    throw new Error('Invalid submission data.')

  const data = submission.value

  // Auth0のユーザー情報を更新
  loginSession.auth0User = await updateAuth0User({
    sub: account.sub,
    name: data.name,
  })

  // DBのアカウント情報を更新
  loginSession.account = await updateAccount({
    id: account.id,
    language: data.language,
    timezone: account.timezone,
    theme: data.theme,
  })

  // ログインセッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, { ...loginSession })
  const encodedSession = await commitSession(session)

  const toastMsg = 'account.message.updated'
  return redirectWithSuccess([ACCOUNT_URL, 'settings'].join('/'), toastMsg, {
    headers: {
      // 新しいセッション情報をクッキーとして設定するように指示
      'Set-Cookie': encodedSession,
    },
  })
})
