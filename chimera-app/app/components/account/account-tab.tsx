import { useTranslation } from 'react-i18next'
import { Separator } from '~/components/ui/separator'
import type { AccountSettings } from '~/types/accounts'
import { AccountForm } from './account-form'
import { AccounyDeleteButton } from './account-delete-button'

interface AccountTabProps {
  accountSettings: AccountSettings
}

export function AccountTab({ accountSettings }: AccountTabProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold">{t('account.title-account')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('account.message.account_info')}
        </p>
      </div>
      <Separator />
      <AccountForm accountSettings={accountSettings}>
        <AccounyDeleteButton />
      </AccountForm>
    </div>
  )
}
