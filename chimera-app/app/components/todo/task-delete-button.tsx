import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { Task } from '~/types/tasks'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'

export interface TaskDeleteButtonProps {
  task: Task | undefined
  redirectUrl: string
}

export function TaskDeleteButton({ task, redirectUrl }: TaskDeleteButtonProps) {
  const { t } = useTranslation()

  if (!task) return null

  return (
    <TaskDeleteConfirmDialog task={task} redirectUrl={redirectUrl}>
      <Button type="button" variant="link" className="text-destructive px-0">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </TaskDeleteConfirmDialog>
  )
}
