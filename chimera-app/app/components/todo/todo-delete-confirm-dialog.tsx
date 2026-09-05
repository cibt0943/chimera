import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { TODO_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { TodoType } from '~/types/todos'
import { DeleteTodo } from '~/types/view-todos'

export interface TodoDeleteConfirmDialogProps {
  redirectUrl: string
  todo?: DeleteTodo
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function TodoDeleteConfirmDialog({
  todo,
  redirectUrl,
  isOpen,
  onOpenChange,
  children,
}: TodoDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  if (!todo) return null

  const desc = `「${todo.title}」${t('common.message.confirm_deletion')}`
  const action = `${TODO_URL}/${todo.todoId}/delete`

  const title =
    todo.type === TodoType.BAR
      ? t('todoBar.message.todo_bar_deletion')
      : t('task.message.task_deletion')

  return (
    <ConfirmDialog
      title={title}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      trigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
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
