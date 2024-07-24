import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { deleteAccount } from '~/models/account.server'
import { deleteAuth0User } from '~/lib/auth0-api.server'

export const action = withAuthentication(async ({ loginSession }) => {
  // Auth0のユーザーを削除
  await deleteAuth0User(loginSession.auth0User.sub)
  // DBからアカウントを削除
  await deleteAccount(loginSession.account.id)

  return redirect('/auth/logout')
})
