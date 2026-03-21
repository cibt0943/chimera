import { redirect } from 'react-router'
import { authenticator } from '~/lib/auth/auth.server'
import { getSession, commitSession } from '~/lib/session.server'
import type { Route } from './+types/auth0.callback'

// Auth0から認証成功した際に呼び出されるページ
export async function loader({ request }: Route.LoaderArgs) {
  // 認証されている場合はルートページへリダイレクト
  const loginInfo = await authenticator.authenticate('auth0', request)

  if (!loginInfo) {
    return redirect('/login')
  }

  const session = await getSession(request.headers.get('cookie'))
  session.set('loginInfo', loginInfo)

  return redirect('/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}
