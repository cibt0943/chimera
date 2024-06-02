import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccountBySub, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { AccountForm } from '~/components/account/account-form'

export const meta: MetaFunction = () => {
  return [{ title: 'Profile | Kobushi' }]
}

export const action = withAuthentication(async ({ request, account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }

  const formData = await request.formData()
  // Auth0のユーザー情報を更新
  const name = formData.get('name')?.toString()

  await updateAuth0User({
    sub: self.sub,
    name: name || self.name,
  })

  // DBのアカウント情報を更新
  const language = formData.get('language')?.toString()
  accountModel.language = language || 'auto'
  await updateAccount(accountModel)

  // セッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, {
    ...self,
    name,
    language,
  })

  return redirect('/account/profile', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
})

export const loader = withAuthentication(async ({ account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }
  return json({ self })
})

export default function Profile() {
  const { self } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-6 w-1/3">
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Update your account settings.
        </p>
      </div>
      <Separator />
      <AccountForm account={self} />
      <Form action={`/account/delete`} method="delete">
        <Button type="submit" variant="destructive">
          アカウントを削除する
        </Button>
      </Form>
    </div>
  )
}
