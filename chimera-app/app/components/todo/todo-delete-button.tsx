import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { Task } from '~/types/tasks'
import { TodoDeleteConfirmDialog } from './todo-delete-confirm-dialog'

export interface TodoDeleteButtonProps {
  task: Task | undefined
  redirectUrl: string
}

export function TodoDeleteButton({ task, redirectUrl }: TodoDeleteButtonProps) {
  const { t } = useTranslation()

  if (!task) return null

  return (
    <TodoDeleteConfirmDialog viewTodo={task} redirectUrl={redirectUrl}>
      <Button type="button" variant="link" className="text-destructive px-0">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </TodoDeleteConfirmDialog>
  )
}
