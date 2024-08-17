import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { AccountDeleteConfirmDialog } from './account-delete-confirm-dialog'

export function AccounyDeleteButton() {
  const { t } = useTranslation()

  return (
    <AccountDeleteConfirmDialog>
      <Button
        type="button"
        variant="link"
        className="mt-2 border-destructive/50 px-0 text-destructive sm:mt-0"
      >
        {t('account.message.do_delete')}
      </Button>
    </AccountDeleteConfirmDialog>
  )
}
