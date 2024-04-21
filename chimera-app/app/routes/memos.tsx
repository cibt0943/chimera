import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { authenticator } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Memo | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const account = await authenticator.authenticate('auth0', request)
  // const account = await authenticator.isAuthenticated(request, {
  //   failureRedirect: '/login',
  // })

  return {}
}

export default function Layout() {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  )
}
