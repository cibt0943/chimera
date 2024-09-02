import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { ACCOUNT_URL } from '~/constants'
import { FormFooter } from '~/components/lib/form'
import type { AccountPassword } from '~/types/accounts'

interface AccountPasswordTabProps {
  accountPassword: AccountPassword
}

export function AccountPasswordTab({
  accountPassword,
}: AccountPasswordTabProps) {
  const { t } = useTranslation()
  const action = [ACCOUNT_URL, 'password'].join('/')

  return (
    <div className="space-y-6">
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>{t('account.message.last_login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {format(
              accountPassword.lastLogin,
              t('common.format.date_time_format'),
            )}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('account.message.last_password_change')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {format(
              accountPassword.lastPasswordChange,
              t('common.format.date_time_format'),
            )}
          </p>
        </CardContent>
      </Card>
      <Form action={action} method="post">
        <FormFooter>
          <Button type="submit">{t('account.message.change_password')}</Button>
        </FormFooter>
      </Form>
    </div>
  )
}
