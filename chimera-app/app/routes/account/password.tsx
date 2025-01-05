import { redirect } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuMailWarning } from 'react-icons/lu'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { changePasswordAuth0User } from '~/lib/auth0-api.server'
import { AlertDescription, AlertTitle } from '~/components/ui/alert'
import type { Route } from './+types/password'

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  // Auth0のパスワードリセットAPIを呼び出す
  await changePasswordAuth0User(loginInfo.auth0User.email)

  return redirect(`/account/password`)
}

export default function AccountPassword() {
  const { t } = useTranslation()

  return (
    <div>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">{t('account.message.password')}</h2>
        <div className="flex flex-row items-center rounded-lg border p-3 text-sm shadow-sm">
          <LuMailWarning className="h-6 w-6" />
          <div className="ml-4">
            <AlertTitle>
              {t('account.message.changed_password_info')}
            </AlertTitle>
            <AlertDescription>
              {t('account.message.changed_password_description')}
            </AlertDescription>
          </div>
        </div>
      </div>
    </div>
  )
}
