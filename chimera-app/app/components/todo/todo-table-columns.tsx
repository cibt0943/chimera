import { NavLink } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { RiEqualFill } from 'react-icons/ri'
import { format } from 'date-fns'
import { ColumnDef, Column, Row } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { TODO_URL } from '~/constants'
import { Task, TaskStatusList } from '~/types/tasks'
import { TodoTableColumnHeader } from './todo-table-column-header'
import { TodoTableRowActions } from './todo-table-row-actions'

// Cell Component
function RowDragHandleCell({ rowId }: { rowId: string }) {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })
  return (
    // Alternatively, you could set these attributes on the rows themselves
    <Button variant="ghost" {...attributes} {...listeners} size="icon">
      <RiEqualFill className="h-4 w-4 font-bold" />
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
  const task = row.original
  const dueDateStr = task.dueDate
    ? format(
        task.dueDate,
        task.dueDateAllDay
          ? t('common.format.date_format')
          : t('common.format.date_time_short_format'),
      )
    : ''
  return (
    <span>
      <ClientOnly fallback={<>&nbsp;</>}>{() => dueDateStr}</ClientOnly>
    </span>
  )
}

function StatusCell({ row }: { row: Row<Task> }) {
  const { t } = useTranslation()
  const status = TaskStatusList[row.original.status]
  return status ? <Badge className={status.color}>{t(status.label)}</Badge> : ''
}

export const TodoTableColumns: ColumnDef<Task>[] = [
  {
    id: 'dragHandle',
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
        <NavLink
          to={[TODO_URL, row.id].join('/')}
          className="truncate font-medium"
        >
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
    size: 60,
    cell: ({ row, table }) => <TodoTableRowActions row={row} table={table} />,
  },
]
