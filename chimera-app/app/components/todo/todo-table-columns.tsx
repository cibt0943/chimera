import { NavLink } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { ColumnDef, Column, Row } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Task, TaskStatusList } from '~/types/tasks'
import { TodoTableColumnHeader } from './todo-table-column-header'
import { TodoTableRowActions } from './todo-table-row-actions'
import { ClientOnly } from 'remix-utils/client-only'

// Cell Component
function RowDragHandleCell({ rowId }: { rowId: string }) {
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

function ColumnHeader({
  column,
  title,
}: {
  column: Column<Task, unknown>
  title: string
}) {
  const { t } = useTranslation()
  return <TodoTableColumnHeader column={column} title={t(title)} />
}

function DueDateCell({ row }: { row: Row<Task> }) {
  const { t } = useTranslation()
  const dateStr = row.original.due_date
  return dateStr ? (
    <ClientOnly>
      {() => (
        <span>
          {format(dateStr, t('common.format.date_time_short_format'))}
        </span>
      )}
    </ClientOnly>
  ) : (
    ''
  )
}

function StatusCell({ row }: { row: Row<Task> }) {
  const { t } = useTranslation()
  const status = TaskStatusList[row.original.status]
  return status ? <Badge className={status.color}>{t(status.label)}</Badge> : ''
}

export const TodoTableColumns: ColumnDef<Task>[] = [
  {
    id: 'drag-handle',
    size: 40,
    header: '',
    cell: ({ row }) => <RowDragHandleCell rowId={row.original.id} />,
  },
  // {
  //   accessorKey: 'id',
  //   size: 65,
  //   header: ({ column }) => {
  //     return ColumnHeader({ column, title: 'task.model.id' })
  //   },
  //   cell: ({ row }) => <span className="">{row.original.id}</span>,
  // },
  {
    accessorKey: 'title',
    size: undefined,
    enableHiding: false,
    header: ({ column }) => {
      return ColumnHeader({ column, title: 'task.model.title' })
    },
    cell: ({ row }) => {
      return (
        <NavLink to={`/todos/${row.id}`} className="truncate font-medium">
          {row.original.title}
        </NavLink>
      )
    },
  },
  {
    accessorKey: 'status',
    size: 100,
    header: ({ column }) => {
      return ColumnHeader({ column, title: 'task.model.status' })
    },
    cell: StatusCell,
    filterFn: (row, id, value) => {
      return value.includes(row.original.status) //id="status"
    },
  },
  {
    accessorKey: 'due_date',
    size: 150,
    header: ({ column }) => {
      return ColumnHeader({ column, title: 'task.model.due_date' })
    },
    cell: DueDateCell,
  },
  {
    id: 'actions',
    size: 80,
    cell: ({ row, table }) => <TodoTableRowActions row={row} table={table} />,
  },
]
