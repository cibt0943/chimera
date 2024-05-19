import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

import { Task, TaskStatusList } from '~/types/tasks'
import { TodoTableColumnHeader } from './todo-table-column-header'
import { TodoTableRowActions } from './todo-table-row-actions'

// Cell Component
function RowDragHandleCell({ rowId }: { rowId: number }) {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <Button variant="ghost" {...attributes} {...listeners} className=" h-8 w-8">
      🟰
    </Button>
  )
}

export const TodoTableColumns: ColumnDef<Task>[] = [
  {
    id: 'drag-handle',
    header: '',
    cell: ({ row }) => <RowDragHandleCell rowId={row.original.id} />,
    size: 40,
  },
  {
    accessorKey: 'id',
    size: 65,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <span className="">{row.original.id}</span>,
  },
  {
    accessorKey: 'title',
    size: undefined,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="タイトル" />
    ),
    cell: ({ row }) => {
      return <span className="truncate font-medium">{row.original.title}</span>
    },
  },
  {
    accessorKey: 'status',
    size: 100,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="状態" />
    ),
    cell: ({ row }) => {
      const status = TaskStatusList[row.original.status]
      return status ? (
        <Badge className={status.color}>{status.label}</Badge>
      ) : (
        ''
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.status) //id="status"
    },
  },
  {
    accessorKey: 'due_date',
    size: 150,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="期限" />
    ),
    cell: ({ row }) => {
      const dateStr = row.original.due_date
      return dateStr ? <span>{format(dateStr, 'yyyy/MM/dd HH:mm')}</span> : ''
    },
  },
  {
    id: 'actions',
    size: 80,
    cell: ({ row, table }) => <TodoTableRowActions row={row} table={table} />,
  },
]
