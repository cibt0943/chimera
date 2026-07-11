import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { DeleteTodo } from '~/types/view-todos'
import { TodoDeleteConfirmDialog } from './todo-delete-confirm-dialog'

export interface TodoDeleteButtonProps {
  redirectUrl: string
  todo?: DeleteTodo
}

export function TodoDeleteButton({ todo, redirectUrl }: TodoDeleteButtonProps) {
  const { t } = useTranslation()

  if (!todo) return null

  return (
    <TodoDeleteConfirmDialog todo={todo} redirectUrl={redirectUrl}>
      <Button type="button" variant="destructive">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </TodoDeleteConfirmDialog>
  )
}
