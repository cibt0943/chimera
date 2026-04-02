import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { TodoBar } from '~/types/todo-bars'
import { TodoBarForm } from '~/components/todo/todo-bar-form'

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <TodoBarForm todoBar={todoBar} redirectUrl={redirectUrl} />
      </DialogContent>
    </Dialog>
  )
}
