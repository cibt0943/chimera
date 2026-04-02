import { ActionFunctionArgs, redirect } from 'react-router'
import { authenticator } from '~/lib/auth/auth.server'

export async function loader() {
  return redirect('/')
}

// 認証できてない時はAuth0の認証ページにリダイレクト
export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate('auth0', request)
}
