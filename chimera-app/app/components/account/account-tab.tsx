import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { AccountForm } from '~/components/account/account-form'
import { AccountDeleteConfirmDialog } from '~/components/account/account-delete-confirm-dialog'
import type { AccountSettings } from '~/types/accounts'

interface AccountTabProps {
  accountSettings: AccountSettings
}

export function AccountTab({ accountSettings }: AccountTabProps) {
  const { t } = useTranslation()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

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
        <Button
          type="button"
          variant="link"
          className="border-destructive/50 px-0 text-destructive"
          onClick={() => setIsOpenDeleteDialog(true)}
        >
          {t('account.message.do_delete')}
        </Button>
      </AccountForm>
      <AccountDeleteConfirmDialog
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    </div>
  )
}
