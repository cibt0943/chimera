import { redirect } from 'react-router'
import { AUTH_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { deleteAccount } from '~/models/account.server'
import { deleteAuth0User } from '~/lib/auth0-api.server'
import type { Route } from './+types/delete'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  // Auth0のユーザーを削除
  await deleteAuth0User(loginInfo.auth0User.sub)
  // DBからアカウントを削除
  await deleteAccount(loginInfo.account.id)

  const url = `${AUTH_URL}/logout`
  return redirect(url)
}
