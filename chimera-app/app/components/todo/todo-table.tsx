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

import { useDebounce, useQueue } from '~/lib/utils'
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
        row.toggleSelected(true)
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

// Table Component
export function TodoTable({ columns, tasks }: TodoTableProps<Task, Tasks>) {
  const navigate = useNavigate()
  const memoColumns = React.useMemo(() => columns, [columns])
  const { toast } = useToast()
  const { enqueue } = useQueue()

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
    getRowId: (row) => row.id.toString(), //required because row indexes
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

  function DeleteConfirmTaskDialog() {
    if (!formTask) return null

    return (
      <TaskDeleteConfirmDialog
        task={formTask}
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    )
  }

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

  function canPositonChange(showToast = true) {
    if (sorting.length > 0) {
      if (showToast) clearSortToast()
      return false
    }

    if (columnFilters.length > 0) {
      if (showToast) clearFilterToast()
      return false
    }
    return true
  }

  // reorder rows after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      const fromIndex = tableData.findIndex((data) => data.id === active.id)
      const toIndex = tableData.findIndex((data) => data.id === over.id)
      updateTaskPosition(fromIndex, toIndex)
    }
  }

  const updateTaskPositionApiDebounce = useDebounce((fromTask, toTask) => {
    enqueue(() => updateTaskPositionApi(fromTask, toTask))
  }, 500)

  async function updateTaskPositionApi(fromTask: Task, toTask: Task) {
    await fetch(`/todos/${fromTask.id}/position`, {
      method: 'POST',
      body: JSON.stringify({ toTaskId: toTask.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update position api')
      }
    })
  }

  // タスクの表示順を更新
  function updateTaskPosition(fromIndex: number, toIndex: number) {
    try {
      const fromTask = tableData[fromIndex]
      const toTask = tableData[toIndex]
      if (!fromTask || !toTask) {
        throw new Error('Failed to update position')
      }

      setTableData((tableData) => {
        return arrayMove(tableData, fromIndex, toIndex) //this is just a splice util
      })

      setRowSelection({ [fromTask.id]: true })

      // タスクの表示順を更新API
      updateTaskPositionApiDebounce(fromTask, toTask)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      alert(msg)
      navigate('.', { replace: true })
      return
    }
  }

  // タスク追加ダイアログを開く
  useHotkeys('mod+i', () => {
    openTaskDialog()
  })

  // 選択行を上下に移動
  useHotkeys(['up', 'down'], (_, handler) => {
    const isUp = !handler.keys ? false : handler.keys.includes('up')
    const nowSelectedRow = table.getSelectedRowModel().rows[0]

    // ソート後の順番で行情報を取得
    const viewRows = table.getRowModel().rows

    let nextSelectIndex = 0
    if (nowSelectedRow) {
      // 表示順に並んでいるviewRowsの中から選択行のindexを取得
      // nowSelectedRow.indexの値は、ソート前のデータのindex
      const viewIndex = viewRows.findIndex(
        (data) => data.id === nowSelectedRow.id,
      )
      nextSelectIndex = isUp ? viewIndex - 1 : viewIndex + 1
    }

    const nextSelectedRow = viewRows[nextSelectIndex]
    if (!nextSelectedRow) return
    nextSelectedRow.toggleSelected(true)
  })

  // 選択行の表示順を上下に移動
  useHotkeys(['alt+up', 'alt+down'], (_, handler) => {
    if (!canPositonChange(false)) return

    const isUp = !handler.keys ? false : handler.keys.includes('up')
    const targetRow = table.getSelectedRowModel().rows[0]
    if (!targetRow) return
    const toIndex = isUp ? targetRow.index - 1 : targetRow.index + 1
    const toRow = table.getRowModel().rows[toIndex]
    if (!toRow) return
    updateTaskPosition(targetRow.index, toRow.index)
  })

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      cancelDrop={() => {
        return !canPositonChange()
      }}
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
        <DeleteConfirmTaskDialog />
      </div>
    </DndContext>
  )
}
