import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Memo } from '~/types/memos'

interface DeleteMemoConfirmDialogProps {
  memo: Memo
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function MemoDeleteConfirmDialog({
  memo,
  isOpen,
  setIsOpen,
}: DeleteMemoConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <DeleteConfirmDialog
      title={t('memo.message.memo_deletion')}
      description={
        '「' +
        (memo.title || t('memo.un_titled')) +
        '」' +
        t('common.message.confirm_deletion')
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Button type="submit" variant="destructive" form="delete-memo-form">
        {t('common.message.delete')}
      </Button>
      <Form
        id="delete-memo-form"
        action={`/memos/${memo.id}/delete`}
        method="delete"
        onSubmit={(event) => {
          setIsOpen(false)
          event.stopPropagation()
        }}
      />
    </DeleteConfirmDialog>
  )
}
