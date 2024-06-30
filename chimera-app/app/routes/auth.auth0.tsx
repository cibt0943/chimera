import type { ActionFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export async function loader() {
  return redirect('/')
}

// 認証できてない時はAuth0の認証ページにリダイレクト
export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('auth0', request)
}
