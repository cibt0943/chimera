import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { Task } from '~/types/tasks'

export interface TaskDeleteConfirmDialogProps {
  task: Task | undefined
  redirectUrl: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function TaskDeleteConfirmDialog({
  task,
  redirectUrl,
  isOpen,
  onOpenChange,
  children,
}: TaskDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  if (!task) return null

  const desc = '「' + task.title + '」' + t('common.message.confirm_deletion')
  const action = `${TODO_URL}/${task.id}/delete`

  return (
    <ConfirmDialog
      title={t('task.message.task_deletion')}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <AlertDialogAction
        className={buttonVariants({ variant: 'destructive' })}
        onClick={async () => {
          await sleep(300) // ダイアログが閉じるアニメーションが終わるまで待機
          fetcher.submit({ redirectUrl }, { method: 'delete', action })
        }}
      >
        {t('common.message.delete')}
      </AlertDialogAction>
    </ConfirmDialog>
  )
}
