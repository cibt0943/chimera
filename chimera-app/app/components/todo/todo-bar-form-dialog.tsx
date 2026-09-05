import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button-base'
import { DeleteTodo } from '~/types/view-todos'
import { TodoType } from '~/types/todos'
import { TodoBar } from '~/types/todo-bars'
import { TodoBarForm } from './todo-bar-form'
import { TodoDeleteButton } from './todo-delete-button'

export interface TodoBarFormDialogProps {
  todoBar: TodoBar | undefined
  redirectUrl: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function TodoBarFormDialog({
  todoBar,
  redirectUrl,
  isOpen,
  onOpenChange,
}: TodoBarFormDialogProps) {
  const { t } = useTranslation()

  const title = todoBar
    ? t('todoBar.message.todo_bar_editing')
    : t('todoBar.message.todo_bar_creation')
  const desc = t('todoBar.message.set_todo_bar_info')

  const todo: DeleteTodo | undefined = todoBar
    ? {
        todoId: todoBar.todoId,
        type: TodoType.BAR,
        title: todoBar.title,
      }
    : undefined

  const formId = todoBar
    ? `todo-bar-form-${todoBar.todoId}`
    : 'todo-bar-form-new'

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
          <TodoBarForm
            todoBar={todoBar}
            formId={formId}
            redirectUrl={redirectUrl}
          />
        </div>
        <DialogFooter className="sm:justify-between">
          <div>
            {todoBar && (
              <TodoDeleteButton todo={todo} redirectUrl={redirectUrl} />
            )}
          </div>
          <Button type="submit" form={formId}>
            {t('common.message.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
