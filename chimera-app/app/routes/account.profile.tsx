import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { authenticator } from '~/lib/auth.server'
import { getAccountBySub } from '~/models/account.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Profile | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const self = await authenticator.authenticate('auth0', request)
  const account = await getAccountBySub(self.sub)
  if (!account) {
    throw new Error('Error: Account not found.')
  }

  return json({ self })
}

export default function Profile() {
  const { self } = useLoaderData<typeof loader>()

  return (
    <div>
      <ul>
        <li>id: {self.sub}</li>
        <li>name: {self.name}</li>
        <li>email: {self.email}</li>
      </ul>
      <div className="mt-8">
        <Form action={`/accounts/delete`} method="delete">
          <Button type="submit" variant="destructive">
            アカウントを削除する
          </Button>
        </Form>
      </div>
    </div>
  )
}
