import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { authenticator } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Reminder | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  // const user = await authenticator.isAuthenticated(request, {
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
