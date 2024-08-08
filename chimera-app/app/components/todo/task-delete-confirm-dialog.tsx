import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Task } from '~/types/tasks'

export interface TaskDeleteConfirmDialogProps {
  task: Task | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit: () => void
}

export function TaskDeleteConfirmDialog({
  task,
  isOpen,
  setIsOpen,
  onSubmit,
}: TaskDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!task) return null

  const action = `/todos/${task.id}/delete`

  return (
    <DeleteConfirmDialog
      title={t('task.message.task_deletion')}
      description={
        '「' + task.title + '」' + t('common.message.confirm_deletion')
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <Button type="submit" variant="destructive" form="delete-task-form">
        {t('common.message.delete')}
      </Button>
      <Form
        id="delete-task-form"
        action={action}
        method="delete"
        onSubmit={onSubmit}
      />
    </DeleteConfirmDialog>
  )
}
