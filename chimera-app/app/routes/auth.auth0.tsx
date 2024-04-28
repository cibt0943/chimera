import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export async function loader() {
  return redirect('/')
}

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('auth0', request)
}
