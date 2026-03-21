import { redirect } from 'react-router'
import { getSession, destroySession } from '~/lib/session.server'
import type { Route } from './+types/auth0.callback'

async function logout(request: Request) {
  const session = await getSession(request.headers.get('cookie'))

  const { AUTH0_LOGOUT_URL, AUTH0_CLIENT_ID, AUTH0_RETURN_TO_URL } = process.env
  if (!AUTH0_LOGOUT_URL || !AUTH0_CLIENT_ID || !AUTH0_RETURN_TO_URL) {
    throw new Error('Missing Auth0 logout environment variables')
  }

  const logoutURL = new URL(AUTH0_LOGOUT_URL)
  logoutURL.searchParams.set('client_id', AUTH0_CLIENT_ID)
  logoutURL.searchParams.set('returnTo', AUTH0_RETURN_TO_URL)

  return redirect(logoutURL.toString(), {
    headers: { 'Set-Cookie': await destroySession(session) },
  })
}

export async function loader({ request }: Route.LoaderArgs) {
  return logout(request)
}

export async function action({ request }: Route.ActionArgs) {
  return logout(request)
}
