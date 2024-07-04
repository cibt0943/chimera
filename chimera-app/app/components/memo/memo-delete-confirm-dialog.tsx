import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Memo } from '~/types/memos'

interface DeleteMemoConfirmDialogProps {
  memo: Memo
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function MemoDeleteConfirmDialog({
  memo,
  isOpenDialog,
  setIsOpenDialog,
}: DeleteMemoConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <DeleteConfirmDialog
      title={t('memo.message.memo_deletion')}
      description={
        '「' + memo.title + '」' + t('common.message.confirm_deletion')
      }
      isOpenDialog={isOpenDialog}
      setIsOpenDialog={setIsOpenDialog}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Form
        action={`/memos/${memo.id}/delete`}
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
