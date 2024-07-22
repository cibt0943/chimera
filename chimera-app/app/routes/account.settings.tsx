import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { useTranslation } from 'react-i18next'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { getAccount, updateAccount } from '~/models/account.server'
import { authenticator } from '~/lib/auth.server'
import { updateAuth0User } from '~/lib/auth0-api.server'
import { getSession, commitSession } from '~/lib/session.server'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { AccountForm } from '~/components/account/account-form'
import { AccountDeleteConfirmDialog } from '~/components/account/account-delete-confirm-dialog'
import { AccountSettingsSchema, AccountSettings } from '~/types/accounts'

export const meta: MetaFunction = () => {
  return [{ title: 'Account settings | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const account = await getAccount(loginSession.account.id)
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: AccountSettingsSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success')
    throw new Error('Invalid submission data.')

  const data = submission.value

  // Auth0のユーザー情報を更新
  loginSession.auth0User = await updateAuth0User({
    sub: account.sub,
    name: data.name,
  })

  // DBのアカウント情報を更新
  loginSession.account = await updateAccount({
    id: account.id,
    language: data.language,
    timezone: account.timezone,
    theme: data.theme,
  })

  // ログインセッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, { ...loginSession })
  const encodedSession = await commitSession(session)

  return redirect('/account/settings', {
    headers: {
      // 新しいセッション情報をクッキーとして設定するように指示
      'Set-Cookie': encodedSession,
    },
  })
})

export const loader = withAuthentication(async ({ loginSession }) => {
  // セッションに保存しているアカウント情報を返す
  // セッションのloginAccountはaccountの値をすでにマージ済みなので、↓DBから取得する必要はない
  // const account = await getAccount(loginAccount.id)
  const accountSettings = {
    name: loginSession.auth0User.name,
    language: loginSession.account.language,
    theme: loginSession.account.theme,
  }
  return typedjson({ accountSettings })
})

export default function Profile() {
  const { t } = useTranslation()
  const { accountSettings } = useTypedLoaderData<{
    accountSettings: AccountSettings
  }>()
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
      <AccountForm accountSettings={accountSettings} />
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
