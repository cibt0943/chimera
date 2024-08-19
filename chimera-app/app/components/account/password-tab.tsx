import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Button } from '~/components/ui/button'
import { FormFooter } from '~/components/lib/form'
import type { AccountSettings } from '~/types/accounts'

interface PasswordTabProps {
  accountSettings: AccountSettings
}

export function PasswordTab({ accountSettings }: PasswordTabProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold">{t('account.title-password')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('account.message.password_info')}
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>{t('account.message.last_login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {format(
              accountSettings.lastLogin,
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
              accountSettings.lastPasswordChange,
              t('common.format.date_time_format'),
            )}
          </p>
        </CardContent>
      </Card>
      <Form action={`/account/password`} method="post">
        <FormFooter>
          <Button type="submit">{t('account.message.change_password')}</Button>
        </FormFooter>
      </Form>
    </div>
  )
}
