import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import type { AccountGeneral } from '~/types/accounts'
import { AccountDeleteConfirmDialog } from './account-delete-confirm-dialog'

interface AccountGeneralTabProps {
  accountGeneral: AccountGeneral
}

export function AccounyDeleteButton({
  accountGeneral,
}: AccountGeneralTabProps) {
  const { t } = useTranslation()

  return (
    <AccountDeleteConfirmDialog accountGeneral={accountGeneral}>
      <Button type="button" variant="destructive">
        {t('account.message.do_delete')}
      </Button>
    </AccountDeleteConfirmDialog>
  )
}
