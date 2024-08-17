import { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

// Auth0から認証成功した際に呼び出されるページ
export async function loader({ request }: LoaderFunctionArgs) {
  // 認証されている場合はルートページへリダイレクト
  return await authenticator.authenticate('auth0', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}
