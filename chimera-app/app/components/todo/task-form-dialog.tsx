import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { TODO_URL } from '~/constants'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'

export interface TaskFormDialogProps {
  task: Task | undefined
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  returnUrl?: string
}

export function TaskFormDialog({
  task,
  isOpen,
  onOpenChange,
  returnUrl = TODO_URL,
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
        <TaskForm
          task={task}
          onSubmit={() => onOpenChange(false)}
          returnUrl={returnUrl}
        />
      </DialogContent>
    </Dialog>
  )
}
