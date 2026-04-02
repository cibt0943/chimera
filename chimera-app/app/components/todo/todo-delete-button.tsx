import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { ViewTodo } from '~/types/view-todos'
import { TodoDeleteConfirmDialog } from './todo-delete-confirm-dialog'

export interface TodoDeleteButtonProps {
  viewTodo: ViewTodo | undefined
  redirectUrl: string
}

export function TodoDeleteButton({
  viewTodo,
  redirectUrl,
}: TodoDeleteButtonProps) {
  const { t } = useTranslation()

  if (!viewTodo) return null

  return (
    <TodoDeleteConfirmDialog viewTodo={viewTodo} redirectUrl={redirectUrl}>
      <Button type="button" variant="link" className="text-destructive px-0">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </TodoDeleteConfirmDialog>
  )
}
