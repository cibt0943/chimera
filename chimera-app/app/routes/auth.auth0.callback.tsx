import type { LoaderFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/lib/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  return await authenticator.authenticate('auth0', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  })
}
