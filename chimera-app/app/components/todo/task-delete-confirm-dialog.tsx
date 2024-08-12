import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Task } from '~/types/tasks'

export interface TaskDeleteConfirmDialogProps {
  task: Task | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
}

export function TaskDeleteConfirmDialog({
  task,
  isOpen,
  setIsOpen,
  onSubmit,
  returnUrl = TODO_URL,
}: TaskDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!task) return null

  const action = [TODO_URL, task.id, 'delete'].join('/')

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
      >
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </DeleteConfirmDialog>
  )
}
