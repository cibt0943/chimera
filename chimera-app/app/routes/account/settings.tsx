import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getAuth0User } from '~/lib/auth0-api.server'
import { AccountTabs } from '~/components/account/account-tabs'
import type { Route } from './+types/settings'
import type { AccountSettings } from '~/types/accounts'

export function meta() {
  return [{ title: 'Account settings | IMA' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)
  // セッションに保存している情報はセッションの値を使う
  // const account = await getAccount(loginInfo.account.id)
  const auth0User = await getAuth0User(loginInfo.auth0User.sub)
  const accountSettings = {
    general: {
      name: loginInfo.auth0User.name,
      language: loginInfo.account.language,
      theme: loginInfo.account.theme,
    },
    password: {
      lastLogin: auth0User.last_login,
      lastPasswordChange: auth0User.last_password_reset,
    },
  }

  return { accountSettings }
}

export default function AccountSettings({ loaderData }: Route.ComponentProps) {
  const { accountSettings } = loaderData

  return <AccountTabs accountSettings={accountSettings} />
}
