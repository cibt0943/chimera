import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'

interface DeleteAccountConfirmDialogProps {
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function AccountDeleteConfirmDialog({
  isOpenDialog,
  setIsOpenDialog,
}: DeleteAccountConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <DeleteConfirmDialog
      title={t('account.message.account_deletion')}
      description={
        t('account.title-account') + t('common.message.confirm_deletion')
      }
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Button type="submit" variant="destructive" form="delete-account-form">
        {t('common.message.delete')}
      </Button>
      <Form
        id="delete-account-form"
        action={`/account/delete`}
        method="delete"
        onSubmit={() => {
          setIsOpenDialog(false)
        }}
      />
    </DeleteConfirmDialog>
  )
}
