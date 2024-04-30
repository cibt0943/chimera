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
  RowSelectionState,
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

interface TodoTableProps<TData extends RowData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  tasks: TData[]
}

// Table Component
export function TodoTable({ columns, tasks }: TodoTableProps<Task, Tasks>) {
  const navigate = useNavigate()
  const memoColumns = React.useMemo(() => columns, [columns])
  const { toast } = useToast()

  // tanstack/react-table
  const [tableData, setTableData] = React.useState<Tasks>(tasks)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [isOpenUpsertDialog, setIsOpenUpsertDialog] = React.useState(false)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const [formTask, setFormTask] = React.useState<Task>() // 編集・削除するタスク

  React.useEffect(() => {
    setTableData(tasks)
  }, [tasks])

  function openTaskDialog(task: Task | undefined = undefined) {
    setFormTask(task)
    setIsOpenUpsertDialog(true)
  }

  function openDeleteTaskDialog(task: Task) {
    setFormTask(task)
    setIsOpenDeleteDialog(true)
  }

  function UpsertTaskDialog() {
    return (
      <TaskUpsertFormDialog
        task={formTask}
        isOpenDialog={isOpenUpsertDialog}
        setIsOpenDialog={setIsOpenUpsertDialog}
      />
    )
  }

  function DeleteConfirmDialog() {
    if (!formTask) return null

    return (
      <TaskDeleteConfirmDialog
        task={formTask}
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    )
  }

  const table = useReactTable({
    data: tableData,
    columns: memoColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
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

  // Row Component
  function DraggableRow({ row }: { row: Row<Task> }) {
    // const { transform, setNodeRef, isDragging } = useSortable({
    const { transform, transition, setNodeRef, isDragging } = useSortable({
      id: row.original.id,
    })

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition: transition,
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
        onClick={() => {
          row.toggleSelected()
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    )
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
      const oldIndex = tableData.findIndex((row) => row.id === active.id)
      const newIndex = tableData.findIndex((row) => row.id === over.id)
      updatePosition(oldIndex, newIndex)
    }
  }

  function updatePosition(fromIndex: number, toIndex: number) {
    try {
      const fromTask = tableData[fromIndex]
      const toTask = tableData[toIndex]
      if (!fromTask || !toTask) {
        throw new Error('Failed to update position')
      }

      setTableData((tableData) => {
        return arrayMove(tableData, fromIndex, toIndex) //this is just a splice util
      })

      fetch(`/todos/${fromTask.id}/position`, {
        method: 'POST',
        body: JSON.stringify({ position: toTask.position }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update position')
        }
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      alert(msg)
      navigate('.', { replace: true })
      return
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

  useHotkeys(['up', 'down'], (_, handler) => {
    if (!handler.keys) return

    const selectedRows = table.getSelectedRowModel().rows[0]
    let nextIndex = 0
    if (selectedRows) {
      const nowIndex = selectedRows.index
      nextIndex = handler.keys[0] === 'up' ? nowIndex - 1 : nowIndex + 1
    }
    const row = table.getRowModel().rows[nextIndex]
    if (!row) return
    table.setRowSelection({ [row.id]: true })
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
                items={tableData}
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
