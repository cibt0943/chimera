import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccountBySub, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { AccountForm } from '~/components/account/account-form'
import { AccountDeleteConfirmDialog } from '~/components/account/account-delete-confirm-dialog'
import { AccountSchema, AccountModel2Account } from '~/types/accounts'

export const meta: MetaFunction = () => {
  return [{ title: 'Account settings | Kobushi' }]
}

export const action = withAuthentication(async ({ request, account }) => {
  const accountModel = await getAccountBySub(account.sub)
  if (!accountModel) throw new Error('Error: Account not found.')

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: AccountSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success')
    throw new Error('Invalid submission data.')

  const data = submission.value

  // Auth0のユーザー情報を更新
  if (data.name) {
    account.name = data.name
    await updateAuth0User({
      sub: account.sub,
      name: account.name,
    })
  }

  // DBのアカウント情報を更新
  accountModel.language = data.language || accountModel.language
  accountModel.theme = data.theme || accountModel.theme
  await updateAccount(accountModel)

  // セッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set(
    authenticator.sessionKey,
    AccountModel2Account(account, accountModel),
  )
  const encodedSession = await commitSession(session)

  return redirect('/account/settings', {
    headers: {
      // 新しいセッション情報をクッキーとして設定するように指示
      'Set-Cookie': encodedSession,
    },
  })
})

export const loader = withAuthentication(async ({ account }) => {
  const accountModel = await getAccountBySub(account.sub)
  if (!accountModel) throw new Error('Error: Account not found.')

  // セッションに保存しているアカウント情報を返す
  // セッションのaccountはaccountModelの値をすでにマージ済み
  return json({ account })
})

export default function Profile() {
  const { t } = useTranslation()
  const { account } = useLoaderData<typeof loader>()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  return (
    <div className="space-y-6 w-[400px]">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold">{t('account.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('account.message.settings_info')}
        </p>
      </div>
      <Separator />
      <AccountForm account={account} />
      <Separator />
      <Button variant="destructive" onClick={() => setIsOpenDeleteDialog(true)}>
        {t('account.message.do_delete')}
      </Button>
      <AccountDeleteConfirmDialog
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    </div>
  )
}
