import * as React from 'react'
import { Form } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { Memo } from '~/types/memos'

export interface MemoDeleteConfirmDialogProps {
  memo: Memo | undefined
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function MemoDeleteConfirmDialog({
  memo,
  isOpen,
  onOpenChange,
  returnUrl = MEMO_URL,
  children,
}: MemoDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!memo) return null

  const action = [MEMO_URL, memo.id, 'delete'].join('/')
  const desc =
    '「' +
    (memo.title || t('memo.message.un_titled')) +
    '」' +
    t('common.message.confirm_deletion')

  return (
    <ConfirmDialog
      title={t('memo.message.memo_deletion')}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      torigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <AlertDialogAction
        type="submit"
        className={buttonVariants({ variant: 'destructive' })}
        form="delete-memo-form"
      >
        {t('common.message.delete')}
      </AlertDialogAction>
      <Form id="delete-memo-form" action={action} method="delete">
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </ConfirmDialog>
  )
}
