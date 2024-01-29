import * as React from 'react'
import { RxPlus } from 'react-icons/rx'
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  useReactTable,
  RowData,
} from '@tanstack/react-table'
import { useHotkeys } from 'react-hotkeys-hook'
import { toDate } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'

import { Task, Tasks, TaskFormObj, TaskStatus } from '~/types/tasks'
import { TodoTableToolbar } from '~/components/todo/todo-table-toolbar'
import { TaskDialog } from '~/components/todo/task-dialog'

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    openEditDialog: (task: TData) => void
  }
}
interface TodoTableProps {
  columns: ColumnDef<Task>[]
  data: Tasks
}

export function TodoTable({ columns, data }: TodoTableProps) {
  // tanstack/react-table
  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  //taskDialog関連
  const [openDialog, setOpenDialog] = React.useState(false)
  const [taskFormObj, setTaskFormObj] =
    React.useState<TaskFormObj>(createTaskFormObj())

  function createTaskFormObj(task?: Task): TaskFormObj {
    return {
      id: task?.id || -1,
      title: task?.title || '',
      memo: task?.memo || '',
      status: task?.status || TaskStatus.NEW,
      dueDate: task?.dueDate ? toDate(task?.dueDate) : null,
    }
  }

  function openTaskDialog(taskFormObj: TaskFormObj) {
    setTaskFormObj(taskFormObj)
    setOpenDialog(true)
  }

  function openAddTaskDialog() {
    openTaskDialog(createTaskFormObj())
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    meta: {
      openEditDialog: (task: Task) => {
        openTaskDialog(createTaskFormObj(task))
      },
    },
  })

  useHotkeys('mod+i', () => {
    openAddTaskDialog()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          className="h-8 px-2 lg:px-3"
          onClick={() => {
            openAddTaskDialog()
          }}
        >
          <RxPlus className="mr-2" />
          追加
          <p className="text-[10px] text-muted-foreground ml-2">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-muted-foreground">
              <span className="text-xs">⌘</span>i
            </kbd>
          </p>
        </Button>
        <TodoTableToolbar table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  データはありません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      <TaskDialog
        taskFormObj={taskFormObj}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </div>
  )
}
