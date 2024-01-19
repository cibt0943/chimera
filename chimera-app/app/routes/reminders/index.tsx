import type { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  // const user = await authenticator.isAuthenticated(request, {
  //   failureRedirect: '/login',
  // })

  return {}
}

export default function Reminders() {
  return <h1 className="mb-2 text-xl font-bold">携帯にPush通知</h1>
}
