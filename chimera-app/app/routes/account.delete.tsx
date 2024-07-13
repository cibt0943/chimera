import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccountBySub, deleteAccount } from '~/models/account.server'
import { deleteAuth0User } from '~/lib/auth0-api.server'

export const action = withAuthentication(async ({ account }) => {
  const accountModel = await getAccountBySub(account.sub)
  if (!accountModel) throw new Error('Error: Account not found.')

  // Auth0のユーザーを削除
  await deleteAuth0User(accountModel.sub)
  // DBからアカウントを削除
  await deleteAccount(account.id)

  return redirect('/auth/logout')
})
