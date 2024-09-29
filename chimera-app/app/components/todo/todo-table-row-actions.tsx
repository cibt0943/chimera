import { useTranslation } from 'react-i18next'
import {
  RiMoreLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCircleLine,
  RiProgress4Line,
  RiProgress8Line,
  RiProhibited2Line,
  RiEdit2Line,
  RiDeleteBinLine,
  RiDeleteBack2Line,
  RiCornerDownLeftLine,
} from 'react-icons/ri'
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
  const { userAgent } = useUserAgentAtom()

  const task = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <RiMoreLine className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTask(task, true)
          }}
        >
          <RiArrowUpLine className="mr-2 h-4 w-4" />
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
          <RiArrowDownLine className="mr-2 h-4 w-4" />
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
          <RiCircleLine className="mr-2 h-4 w-4" />
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
          <RiProgress4Line className="mr-2 h-4 w-4" />
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
          <RiProgress8Line className="mr-2 h-4 w-4" />
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
          <RiProhibited2Line className="mr-2 h-4 w-4" />
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
          <RiEdit2Line className="mr-2 h-4 w-4" />
          {t('common.message.edit')}
          <DropdownMenuShortcut>
            <RiCornerDownLeftLine className="inline h-3 w-3" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.deleteTask(task)
          }}
          className="text-red-600 focus:text-red-600"
        >
          <RiDeleteBinLine className="mr-2 h-4 w-4" />
          {t('common.message.delete')}
          <DropdownMenuShortcut>
            {userAgent.modifierKeyIcon + ' '}
            <RiDeleteBack2Line className="inline h-3 w-3" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
