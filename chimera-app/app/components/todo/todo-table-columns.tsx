import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'

import { Task, TaskStatusList } from '~/types/tasks'
import { TodoTableColumnHeader } from './todo-table-column-header'
import { TodoTableRowActions } from './todo-table-row-actions'

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    size: 50,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    size: 80,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="ID" />
    ),
    // cell: ({ row }) => <div className="w-[80px]">{row.getValue('id')}</div>,
    cell: ({ row }) => <div className="">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="タイトル" />
    ),
    cell: ({ row }) => {
      return (
        <div className="">
          <span className="truncate font-medium">
            {row.getValue<string>('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    size: 100,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="状態" />
    ),
    cell: ({ row }) => {
      const status = TaskStatusList.find(
        (status) => status.value === row.getValue('status'),
      )

      if (!status) return ''

      return (
        <div className="items-center">
          <Badge>{status.label}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'dueDate',
    size: 220,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="期限" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue<string>('dueDate')
      if (!dateStr) return ''

      return (
        <div className="items-center">
          {format(dateStr, 'yyyy/MM/dd HH:mm')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row, table }) => <TodoTableRowActions row={row} table={table} />,
  },
]
