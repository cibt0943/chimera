import * as React from 'react'
import { useNavigate } from '@remix-run/react'
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
  Row,
} from '@tanstack/react-table'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  // type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { ToastAction } from '~/components/ui/toast'
import { useToast } from '~/components/ui/use-toast'

import { Task, Tasks } from '~/types/tasks'
import { TodoTableToolbar } from './todo-table-toolbar'
import { TaskUpsertFormDialog } from './task-upsert-form-dialog'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    editTask: (task: TData) => void
    deleteTask: (task: TData) => void
  }
}

// Custom hook for managing state
function useTodoTableState() {
  // tanstack/react-table
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  // const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [isOpenUpsertDialog, setIsOpenUpsertDialog] = React.useState(false)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const [task, setTask] = React.useState<Task>()

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    // rowSelection, setRowSelection,
    isOpenUpsertDialog,
    setIsOpenUpsertDialog,
    isOpenDeleteDialog,
    setIsOpenDeleteDialog,
    task,
    setTask,
  }
}
// Row Component
function DraggableRow({ row }: { row: Row<Task> }) {
  // const { transform, transition, setNodeRef, isDragging } = useSortable({
  const { transform, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    // transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
  }

  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && 'selected'}
      ref={setNodeRef}
      style={style}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

interface TodoTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  tasks: TData[]
}

// Table Component
export function TodoTable({ columns, tasks }: TodoTableProps<Task, Tasks>) {
  const navigate = useNavigate()
  const memoColumns = React.useMemo(() => columns, [columns])
  const [data, setData] = React.useState(tasks)
  // const dataIds = React.useMemo<UniqueIdentifier[]>(
  //   () => data?.map(({ id }) => id),
  //   [data],
  // )

  React.useEffect(() => {
    setData(tasks)
  }, [tasks])

  const { toast } = useToast()

  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
    // rowSelection,
    // setRowSelection,
    isOpenUpsertDialog,
    setIsOpenUpsertDialog,
    isOpenDeleteDialog,
    setIsOpenDeleteDialog,
    task,
    setTask,
  } = useTodoTableState()

  function openTaskDialog(task: Task | undefined = undefined) {
    setTask(task)
    setIsOpenUpsertDialog(true)
  }

  function openDeleteTaskDialog(task: Task) {
    setTask(task)
    setIsOpenDeleteDialog(true)
  }

  function UpsertTaskDialog() {
    return (
      <TaskUpsertFormDialog
        task={task}
        isOpenDialog={isOpenUpsertDialog}
        setIsOpenDialog={setIsOpenUpsertDialog}
      />
    )
  }

  function DeleteConfirmDialog() {
    if (!task) return null

    return (
      <TaskDeleteConfirmDialog
        task={task}
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    )
  }

  const table = useReactTable({
    data: data,
    columns: memoColumns,
    state: {
      // rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    // enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // getRowId: (row) => row.id.toString(), //required because row indexes
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
      editTask: (task: Task) => {
        openTaskDialog(task)
      },
      deleteTask: (task: Task) => {
        openDeleteTaskDialog(task)
      },
    },
  })

  function clearSortToast() {
    toast({
      duration: 8000,
      variant: 'destructive',
      description: (
        <div className="">
          ソート中は並び順を変更することはできません。
          <br />
          ソートをクリアしますか？
        </div>
      ),
      action: (
        <ToastAction
          altText="ソートをクリアする"
          onClick={() => {
            table.resetSorting()
          }}
        >
          クリア
        </ToastAction>
      ),
    })
  }

  function clearFilterToast() {
    toast({
      duration: 8000,
      variant: 'destructive',
      description: (
        <div className="">
          フィルタ中は並び順を変更することはできません。
          <br />
          フィルタをクリアしますか？
        </div>
      ),
      action: (
        <ToastAction
          altText="フィルタをクリアする"
          onClick={() => {
            table.resetColumnFilters()
          }}
        >
          クリア
        </ToastAction>
      ),
    })
  }

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (sorting.length > 0) {
      clearSortToast()
      return
    }

    if (columnFilters.length > 0) {
      clearFilterToast()
      return
    }

    if (active && over && active.id !== over.id) {
      const oldIndex = data.findIndex((row) => row.id === active.id)
      const newIndex = data.findIndex((row) => row.id === over.id)

      setData((data) => {
        return arrayMove(data, oldIndex, newIndex) //this is just a splice util
      })

      fetch(`/todos/${active.id}/position`, {
        method: 'POST',
        body: JSON.stringify({ position: data[newIndex].position }),
      }).then((response) => {
        if (!response.ok) {
          alert('Failed to update position')
          navigate('.', { replace: true })
        }
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  useHotkeys('mod+i', () => {
    openTaskDialog()
  })

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            className="h-8 px-2 lg:px-3"
            onClick={() => openTaskDialog()}
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
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        width:
                          header.column.columnDef.size !== undefined
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
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <SortableContext
                // items={dataIds}
                items={data}
                strategy={verticalListSortingStrategy}
              >
                {table.getRowModel().rows?.length ? (
                  table
                    .getRowModel()
                    .rows.map((row) => <DraggableRow key={row.id} row={row} />)
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
              </SortableContext>
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={table.previousPage}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <UpsertTaskDialog />
        <DeleteConfirmDialog />
      </div>
    </DndContext>
  )
}
