import { useTranslation } from 'react-i18next'
import {
  LuEllipsis,
  LuArrowUpFromLine,
  LuArrowDownFromLine,
  LuCircleDot,
  LuCirclePlay,
  LuCircleCheck,
  LuCirclePause,
  LuPencilLine,
  LuTrash2,
  LuDelete,
  LuCornerDownLeft,
} from 'react-icons/lu'
import { Row, Table } from '@tanstack/react-table'
import { Button } from '~/components/ui/button-base'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '~/components/ui/dropdown-menu'
import { useUserAgentAtom } from '~/lib/global-state'
import { TaskStatus } from '~/types/tasks'
import { TodoType } from '~/types/todos'
import { ViewTodo } from '~/types/view-todos'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function TodoTableRowActions({
  row,
  table,
}: DataTableRowActionsProps<ViewTodo>) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()

  const viewTodo = row.original
  const isTask = viewTodo.type === TodoType.TASK
  const heightCss = isTask ? '' : 'h-6'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className={heightCss} />}
      >
        <LuEllipsis />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTodo(viewTodo, true)
          }}
        >
          <LuArrowUpFromLine />
          {t('common.message.position_up')}
          <DropdownMenuShortcut>
            {`${userAgent.modifierKeyIcon} ↑`}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTodo(viewTodo, false)
          }}
        >
          <LuArrowDownFromLine />
          {t('common.message.position_down')}
          <DropdownMenuShortcut>
            {`${userAgent.modifierKeyIcon} ↓`}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {isTask && (
          <>
            <DropdownMenuItem
              disabled={viewTodo.status === TaskStatus.NEW}
              onClick={() => {
                table.options.meta?.updateTodoStatus({
                  ...viewTodo,
                  status: TaskStatus.NEW,
                })
              }}
            >
              <LuCircleDot />
              {t('task.message.to_new')}
              <DropdownMenuShortcut>
                {`${userAgent.modifierKeyIcon} 1`}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={viewTodo.status === TaskStatus.DOING}
              onClick={() => {
                table.options.meta?.updateTodoStatus({
                  ...viewTodo,
                  status: TaskStatus.DOING,
                })
              }}
            >
              <LuCirclePlay />
              {t('task.message.to_doing')}
              <DropdownMenuShortcut>
                {`${userAgent.modifierKeyIcon} 2`}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={viewTodo.status === TaskStatus.DONE}
              onClick={() => {
                table.options.meta?.updateTodoStatus({
                  ...viewTodo,
                  status: TaskStatus.DONE,
                })
              }}
            >
              <LuCircleCheck />
              {t('task.message.to_done')}
              <DropdownMenuShortcut>
                {`${userAgent.modifierKeyIcon} 3`}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={viewTodo.status === TaskStatus.PENDING}
              onClick={() => {
                table.options.meta?.updateTodoStatus({
                  ...viewTodo,
                  status: TaskStatus.PENDING,
                })
              }}
            >
              <LuCirclePause />
              {t('task.message.to_pending')}
              <DropdownMenuShortcut>
                {`${userAgent.modifierKeyIcon} 4`}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.editTodo(viewTodo)
          }}
        >
          <LuPencilLine />
          {t('common.message.edit')}
          <DropdownMenuShortcut>
            <LuCornerDownLeft className="inline" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            table.options.meta?.deleteTodo(viewTodo)
          }}
        >
          <LuTrash2 />
          {t('common.message.delete')}
          <DropdownMenuShortcut>
            {`${userAgent.modifierKeyIcon} `}
            <LuDelete className="inline" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
