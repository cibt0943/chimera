import { MetaFunction } from '@remix-run/node'
import { redirectWithSuccess } from 'remix-toast'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccount, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { getAuth0User, updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { AccountTabs } from '~/components/account/account-tabs'
import { AccountSettingsSchema } from '~/types/accounts'
import type { AccountSettings } from '~/types/accounts'

export const meta: MetaFunction = () => {
  return [{ title: 'Account settings | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const account = await getAccount(loginSession.account.id)
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: AccountSettingsSchema })
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
  return redirectWithSuccess('/account/settings', toastMsg, {
    headers: {
      // 新しいセッション情報をクッキーとして設定するように指示
      'Set-Cookie': encodedSession,
    },
  })
})

type LoaderData = {
  accountSettings: AccountSettings
}

export const loader = withAuthentication(async ({ loginSession }) => {
  // セッションに保存している情報はセッションの値を使う
  // const account = await getAccount(loginSession.account.id)
  const auth0User = await getAuth0User(loginSession.auth0User.sub)
  const accountSettings = {
    name: loginSession.auth0User.name,
    language: loginSession.account.language,
    theme: loginSession.account.theme,
    lastLogin: auth0User.last_login,
    lastPasswordChange: auth0User.last_password_reset,
  }

  return typedjson({ accountSettings })
})

export default function AccountSettings() {
  const { accountSettings } = useTypedLoaderData<LoaderData>()

  return <AccountTabs accountSettings={accountSettings} />
}
