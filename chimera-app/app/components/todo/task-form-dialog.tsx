import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { DeleteTodo } from '~/types/view-todos'
import { TodoType } from '~/types/todos'
import { Task } from '~/types/tasks'
import { TaskForm } from './task-form'
import { TodoDeleteButton } from './todo-delete-button'

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

  const todo: DeleteTodo | undefined = task
    ? {
        todoId: task.todoId,
        type: TodoType.TASK,
        title: task.title,
      }
    : undefined

  const formId = task ? `task-form-${task.todoId}` : 'task-form-new'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <TaskForm task={task} formId={formId} redirectUrl={redirectUrl} />
        </div>
        <DialogFooter className="sm:justify-between">
          <div>
            {task && <TodoDeleteButton todo={todo} redirectUrl={redirectUrl} />}
          </div>
          <Button type="submit" form={formId}>
            {t('common.message.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
