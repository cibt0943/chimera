import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { MEMO_URL } from '~/constants'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Memo } from '~/types/memos'

export interface DeleteMemoConfirmDialogProps {
  memo: Memo | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
}

export function MemoDeleteConfirmDialog({
  memo,
  isOpen,
  setIsOpen,
  onSubmit,
  returnUrl = MEMO_URL,
}: DeleteMemoConfirmDialogProps) {
  const { t } = useTranslation()

  if (!memo) return null

  const action = [MEMO_URL, memo.id, 'delete'].join('/')
  const memoTitle = memo.title || t('memo.un_titled')

  return (
    <DeleteConfirmDialog
      title={t('memo.message.memo_deletion')}
      description={
        '「' + memoTitle + '」' + t('common.message.confirm_deletion')
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <Button type="submit" variant="destructive" form="delete-memo-form">
        {t('common.message.delete')}
      </Button>
      <Form
        id="delete-memo-form"
        action={action}
        method="delete"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </DeleteConfirmDialog>
  )
}
