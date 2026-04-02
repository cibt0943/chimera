import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'

export interface TaskFormDialogProps {
  task: Task | undefined
  redirectUrl: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskFormDialog({
  task,
  redirectUrl,
  isOpen,
  onOpenChange,
}: TaskFormDialogProps) {
  const { t } = useTranslation()

  const title = task
    ? t('task.message.task_editing')
    : t('task.message.task_creation')
  const desc = t('task.message.set_task_info')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <TaskForm task={task} redirectUrl={redirectUrl} />
      </DialogContent>
    </Dialog>
  )
}
