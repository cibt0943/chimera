import { useTranslation } from 'react-i18next'
import {
  RiMoreLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxCircleLine,
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

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function TodoTableRowActions({
  row,
  table,
}: DataTableRowActionsProps<Task>) {
  const { t } = useTranslation()
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
          <DropdownMenuShortcut>⌥ ↑</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.moveTask(task, false)
          }}
        >
          <RiArrowDownLine className="mr-2 h-4 w-4" />
          {t('common.message.position_down')}
          <DropdownMenuShortcut>⌥ ↓</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={task.status === TaskStatus.DONE}
          onClick={() => {
            const upateTask = { ...task, status: TaskStatus.DONE }
            table.options.meta?.updateTaskStatus(upateTask)
          }}
        >
          <RiCheckboxCircleLine className="mr-2 h-4 w-4" />
          {t('task.message.to_complete')}
          <DropdownMenuShortcut>
            ⌥ <RiCornerDownLeftLine className="h-3 w-3 inline" />
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
            <RiCornerDownLeftLine className="h-3 w-3 inline" />
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
            ⌥ <RiDeleteBack2Line className="h-3 w-3 inline" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
