import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { authenticator } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'profile | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)

  return { user }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div>
      <ul>
        <li>id: {user.sub}</li>
        <li>name: {user.name}</li>
        <li>email: {user.email}</li>
      </ul>
    </div>
  )
}
