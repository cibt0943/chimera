import { Row, Table } from '@tanstack/react-table'
import {
  RxDotsHorizontal,
  RxArrowUp,
  RxArrowDown,
  RxCheckCircled,
  RxPencil1,
  RxTrash,
} from 'react-icons/rx'
import { RiDeleteBack2Line, RiCornerDownLeftLine } from 'react-icons/ri'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '~/components/ui/dropdown-menu'
import { TaskStatus } from '~/types/tasks'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

export function TodoTableRowActions<TData>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const task = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <RxDotsHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.updateTaskPosition(task, true)
          }}
        >
          <RxArrowUp className="mr-2 h-4 w-4" />
          一つ上に移動
          <DropdownMenuShortcut>⌘↑</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.updateTaskPosition(task, false)
          }}
        >
          <RxArrowDown className="mr-2 h-4 w-4" />
          一つ下に移動
          <DropdownMenuShortcut>⌘↓</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.updateTaskStatus(task, TaskStatus.DONE)
          }}
        >
          <RxCheckCircled className="mr-2 h-4 w-4" />
          完了する
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.options.meta?.editTask(task)
          }}
        >
          <RxPencil1 className="mr-2 h-4 w-4" />
          編集
          <DropdownMenuShortcut>
            ⌘
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
          <RxTrash className="mr-2 h-4 w-4" />
          削除
          <DropdownMenuShortcut>
            ⌘<RiDeleteBack2Line className="h-3 w-3 inline" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
