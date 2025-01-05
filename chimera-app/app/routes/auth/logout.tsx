import { redirect } from 'react-router'
import { getSession, destroySession } from '~/lib/session.server'
import type { Route } from './+types/auth0.callback'

async function logout(request: Request) {
  const session = await getSession(request.headers.get('cookie'))
  const logoutURL = new URL(process.env.AUTH0_LOGOUT_URL!)
  logoutURL.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!)
  logoutURL.searchParams.set('returnTo', process.env.AUTH0_RETURN_TO_URL!)
  return redirect(logoutURL.toString(), {
    headers: { 'Set-Cookie': await destroySession(session) },
  })
}

export async function loader({ request }: Route.LoaderArgs) {
  return await logout(request)
}

export async function action({ request }: Route.ActionArgs) {
  return await logout(request)
}
