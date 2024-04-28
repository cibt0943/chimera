import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { withAuthentication } from '~/lib/auth-middleware'
import { Account } from '~/types/accounts'
import { getAccountBySub } from '~/models/account.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Profile | Kobushi' }]
}

export const loader = withAuthentication(async ({ account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }

  return json({ self })
})

type LoaderData = {
  self: Account
}

export default function Profile() {
  const { self } = useLoaderData<LoaderData>()

  return (
    <div>
      <ul>
        <li>id: {self.sub}</li>
        <li>name: {self.name}</li>
        <li>email: {self.email}</li>
      </ul>
      <div className="mt-8">
        <Form action={`/account/delete`} method="delete">
          <Button type="submit" variant="destructive">
            アカウントを削除する
          </Button>
        </Form>
      </div>
    </div>
  )
}
