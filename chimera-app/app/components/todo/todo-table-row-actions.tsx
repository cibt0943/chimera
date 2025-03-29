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
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '~/components/ui/dropdown-menu'
import { Task, TaskStatus } from '~/types/tasks'
import { useUserAgentAtom } from '~/lib/global-state'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function TodoTableRowActions({
  row,
  table,
}: DataTableRowActionsProps<Task>) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()

  const task = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <LuEllipsis />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTask(task, true)
          }}
        >
          <LuArrowUpFromLine />
          {t('common.message.position_up')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' ↑'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTask(task, false)
          }}
        >
          <LuArrowDownFromLine />
          {t('common.message.position_down')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' ↓'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={task.status === TaskStatus.NEW}
          onClick={() => {
            const upateTask = { ...task, status: TaskStatus.NEW }
            table.options.meta?.updateTaskStatus(upateTask)
          }}
        >
          <LuCircleDot />
          {t('task.message.to_new')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' 1'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={task.status === TaskStatus.DOING}
          onClick={() => {
            const upateTask = { ...task, status: TaskStatus.DOING }
            table.options.meta?.updateTaskStatus(upateTask)
          }}
        >
          <LuCirclePlay />
          {t('task.message.to_doing')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' 2'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={task.status === TaskStatus.DONE}
          onClick={() => {
            const upateTask = { ...task, status: TaskStatus.DONE }
            table.options.meta?.updateTaskStatus(upateTask)
          }}
        >
          <LuCircleCheck />
          {t('task.message.to_done')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' 3'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={task.status === TaskStatus.PENDING}
          onClick={() => {
            const upateTask = { ...task, status: TaskStatus.PENDING }
            table.options.meta?.updateTaskStatus(upateTask)
          }}
        >
          <LuCirclePause />
          {t('task.message.to_pending')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' 4'}
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.editTask(task)
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
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            table.options.meta?.deleteTask(task)
          }}
        >
          <LuTrash2 />
          {t('common.message.delete')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' '}
            <LuDelete className="inline" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
