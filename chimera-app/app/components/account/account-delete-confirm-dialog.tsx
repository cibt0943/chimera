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
      title={t('account.message.account-deletion')}
      description={t('account.title') + t('common.message.confirm-deletion')}
      isOpenDialog={isOpenDialog}
      setIsOpenDialog={setIsOpenDialog}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Form
        action={`/account/delete`}
        method="delete"
        onSubmit={() => {
          setIsOpenDialog(false)
        }}
      >
        <Button type="submit" variant="destructive">
          {t('common.message.delete')}
        </Button>
      </Form>
    </DeleteConfirmDialog>
  )
}
