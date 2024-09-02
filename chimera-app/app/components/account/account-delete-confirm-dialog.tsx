import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { ACCOUNT_URL } from '~/constants'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import type { AccountGeneral } from '~/types/accounts'

interface DeleteAccountConfirmDialogProps {
  accountGeneral: AccountGeneral
  children: React.ReactNode
}

export function AccountDeleteConfirmDialog({
  accountGeneral,
  children,
}: DeleteAccountConfirmDialogProps) {
  const { t } = useTranslation()

  const action = [ACCOUNT_URL, 'delete'].join('/')
  const desc =
    '「' + accountGeneral.name + '」' + t('common.message.confirm_deletion')

  return (
    <ConfirmDialog
      title={t('account.message.account_deletion')}
      description={desc}
      torigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <AlertDialogAction
        type="submit"
        className={buttonVariants({ variant: 'destructive' })}
        form="delete-account-form"
      >
        {t('common.message.delete')}
      </AlertDialogAction>
      <Form id="delete-account-form" action={action} method="delete" />
    </ConfirmDialog>
  )
}
