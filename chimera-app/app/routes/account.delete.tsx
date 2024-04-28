import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccountBySub, deleteAccount } from '~/models/account.server'

export const action = withAuthentication(async ({ account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }

  await deleteAccount(self.id)

  return redirect('/')
})
