import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccountBySub, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { AccountForm } from '~/components/account/account-form'
import { AccountDeleteConfirmDialog } from '~/components/account/account-delete-confirm-dialog'

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
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  function DeleteConfirmAccountDialog() {
    return (
      <AccountDeleteConfirmDialog
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    )
  }

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
      <Separator />
      <Button variant="destructive" onClick={() => setIsOpenDeleteDialog(true)}>
        アカウントを削除する
      </Button>
      <DeleteConfirmAccountDialog />
    </div>
  )
}
