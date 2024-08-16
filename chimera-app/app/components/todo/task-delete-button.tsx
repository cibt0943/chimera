import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import { Task } from '~/types/tasks'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'

export interface TaskDeleteButtonProps {
  task: Task | undefined
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
}

export function TaskDeleteButton({
  task,
  onSubmit,
  returnUrl = TODO_URL,
}: TaskDeleteButtonProps) {
  const { t } = useTranslation()

  if (!task) return null

  return (
    <TaskDeleteConfirmDialog
      task={task}
      onSubmit={onSubmit}
      returnUrl={returnUrl}
    >
      <Button
        type="button"
        variant="link"
        className="mt-2 border-destructive/50 px-0 text-destructive sm:mt-0"
      >
        <RiDeleteBinLine className="mr-1 h-4 w-4" />
        {t('common.message.delete')}
      </Button>
    </TaskDeleteConfirmDialog>
  )
}
