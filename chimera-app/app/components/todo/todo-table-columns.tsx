import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { Badge } from '~/components/ui/badge'
// import { Checkbox } from '~/components/ui/checkbox'

import { Task, TaskStatusList } from '~/types/tasks'
import { TodoTableColumnHeader } from './todo-table-column-header'
import { TodoTableRowActions } from './todo-table-row-actions'

// Cell Component
const RowDragHandleCell = ({ rowId }: { rowId: number }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <button {...attributes} {...listeners}>
      🟰
    </button>
  )
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'drag-handle',
    header: '',
    cell: ({ row }) => <RowDragHandleCell rowId={row.getValue('id')} />,
    size: 40,
  },
  // {
  //   id: 'select',
  //   size: 50,
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && 'indeterminate')
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'id',
    size: 65,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <span className="">{row.getValue('id')}</span>,
  },
  {
    accessorKey: 'title',
    size: undefined,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="タイトル" />
    ),
    cell: ({ row }) => {
      return (
        <span className="truncate font-medium">{row.getValue('title')}</span>
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
        (e) => e.value === row.getValue('status'),
      )
      return status ? <Badge>{status.label}</Badge> : ''
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) //id="status"
    },
  },
  {
    accessorKey: 'dueDate',
    size: 150,
    header: ({ column }) => (
      <TodoTableColumnHeader column={column} title="期限" />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue<string>('dueDate')
      return dateStr ? <span>{format(dateStr, 'yyyy/MM/dd HH:mm')}</span> : ''
    },
  },
  {
    id: 'actions',
    size: 80,
    cell: ({ row, table }) => <TodoTableRowActions row={row} table={table} />,
  },
]
