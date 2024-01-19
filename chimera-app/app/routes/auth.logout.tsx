import type { ActionFunctionArgs } from '@remix-run/node'
// import { redirect } from '@remix-run/node'

// import { getSession, destroySession } from '~/lib/session.server'
import { authenticator } from '~/lib/auth.server'

export async function action({ request }: ActionFunctionArgs) {
  // const session = await getSession(request.headers.get('Cookie'))
  // const logoutURL = new URL(process.env.AUTH0_LOGOUT_URL!)
  // logoutURL.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!)
  // logoutURL.searchParams.set('returnTo', process.env.AUTH0_RETURN_TO_URL!)
  // return redirect(logoutURL.toString(), {
  //   headers: {
  //     'Set-Cookie': await destroySession(session),
  //   },
  // })

  const logoutURL = new URL(process.env.AUTH0_LOGOUT_URL!)
  logoutURL.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!)
  logoutURL.searchParams.set('returnTo', process.env.AUTH0_RETURN_TO_URL!)
  return await authenticator.logout(request, {
    redirectTo: logoutURL.toString(),
  })
}
