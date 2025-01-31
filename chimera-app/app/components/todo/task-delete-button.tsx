import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { Task } from '~/types/tasks'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'

export interface TaskDeleteButtonProps {
  task: Task | undefined
  returnUrl?: string
}

export function TaskDeleteButton({ task, returnUrl }: TaskDeleteButtonProps) {
  const { t } = useTranslation()

  if (!task) return null

  return (
    <TaskDeleteConfirmDialog task={task} returnUrl={returnUrl}>
      <Button
        type="button"
        variant="link"
        className="mt-2 border-destructive/50 px-0 text-destructive sm:mt-0"
      >
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </TaskDeleteConfirmDialog>
  )
}
