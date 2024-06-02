import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Task } from '~/types/tasks'

interface DeleteTaskConfirmDialogProps {
  task: Task
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
}

export function TaskDeleteConfirmDialog({
  task,
  isOpenDialog,
  setIsOpenDialog,
}: DeleteTaskConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <DeleteConfirmDialog
      title={t('todo.message.task-deletion')}
      description={
        '「' + task.title + '」' + t('common.message.confirm-deletion')
      }
      isOpenDialog={isOpenDialog}
      setIsOpenDialog={setIsOpenDialog}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Form
        action={`/todos/${task.id}/delete`}
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
