import { MetaFunction } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAuth0User } from '~/lib/auth0-api.server'
import { AccountTabs } from '~/components/account/account-tabs'
import type { AccountSettings } from '~/types/accounts'

export const meta: MetaFunction = () => {
  return [{ title: 'Account settings | Kobushi' }]
}

type LoaderData = {
  accountSettings: AccountSettings
}

export const loader = withAuthentication(async ({ loginSession }) => {
  // セッションに保存している情報はセッションの値を使う
  // const account = await getAccount(loginSession.account.id)
  const auth0User = await getAuth0User(loginSession.auth0User.sub)
  const accountSettings = {
    general: {
      name: loginSession.auth0User.name,
      language: loginSession.account.language,
      theme: loginSession.account.theme,
    },
    password: {
      lastLogin: auth0User.last_login,
      lastPasswordChange: auth0User.last_password_reset,
    },
  }

  return typedjson({ accountSettings })
})

export default function AccountSettings() {
  const { accountSettings } = useTypedLoaderData<LoaderData>()

  return <AccountTabs accountSettings={accountSettings} />
}
