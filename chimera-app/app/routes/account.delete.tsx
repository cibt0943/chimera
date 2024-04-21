import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'
import { getAccountBySub, deleteAccount } from '~/models/account.server'

export async function action({ request }: ActionFunctionArgs) {
  const self = await authenticator.authenticate('auth0', request)

  const account = getAccountBySub(self.sub)
  if (!account) {
    throw new Error('Error: Account not found.')
  }

  await deleteAccount(self.id)

  return redirect('/')
}
