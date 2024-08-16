import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { Task } from '~/types/tasks'

export interface TaskDeleteConfirmDialogProps {
  task: Task | undefined
  isOpen?: boolean
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function TaskDeleteConfirmDialog({
  task,
  isOpen,
  setIsOpen,
  onSubmit,
  returnUrl = TODO_URL,
  children,
}: TaskDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!task) return null

  const action = [TODO_URL, task.id, 'delete'].join('/')
  const desc = '「' + task.title + '」' + t('common.message.confirm_deletion')

  return (
    <ConfirmDialog
      title={t('task.message.task_deletion')}
      description={desc}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      torigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <AlertDialogAction
        type="submit"
        className={buttonVariants({ variant: 'destructive' })}
        form="delete-task-form"
      >
        {t('common.message.delete')}
      </AlertDialogAction>
      <Form
        id="delete-task-form"
        action={action}
        method="delete"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </ConfirmDialog>
  )
}
