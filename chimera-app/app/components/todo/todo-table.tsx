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

import { useDebounce, useQueue, useIsLoading } from '~/lib/utils'
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
      tabIndex={0}
      id={`row-${row.id}`}
      className="focus:outline-none"
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
  const isLoading = useIsLoading()
  const navigate = useNavigate()
  const memoColumns = React.useMemo(() => columns, [columns])
  const { toast } = useToast()
  const { enqueue } = useQueue()

  // tanstack/react-table
  const [tableData, setTableData] = React.useState<Tasks>(tasks)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'status', value: [0, 2] },
  ])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [isOpenUpsertDialog, setIsOpenUpsertDialog] = React.useState(false)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task>() // 編集・削除するタスク

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

  // タスク追加・編集ダイアログを開く
  function openTaskDialog(task: Task | undefined = undefined) {
    setSelectedTask(task)
    setIsOpenUpsertDialog(true)
  }

  // タスク削除ダイアログを開く
  function openDeleteTaskDialog(task: Task) {
    setSelectedTask(task)
    setIsOpenDeleteDialog(true)
  }

  // タスク追加・編集ダイアログ
  function UpsertTaskDialog() {
    return (
      <TaskUpsertFormDialog
        task={selectedTask}
        isOpenDialog={isOpenUpsertDialog}
        setIsOpenDialog={setIsOpenUpsertDialog}
      />
    )
  }

  function DeleteConfirmTaskDialog() {
    if (!selectedTask) return null

    return (
      <TaskDeleteConfirmDialog
        task={selectedTask}
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

  // ソート中は並び順を変更できない
  function canPositonChange() {
    return sorting.length == 0
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

  // タスクの表示順を更新APIをdebounce
  const updateTaskPositionApiDebounce = useDebounce((fromTask, toTask) => {
    enqueue(() => updateTaskPositionApi(fromTask, toTask))
  }, 300)

  // タスクの表示順を更新API
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

  // 選択行を上下に移動
  function hotkeysUpDown(keys: readonly string[]) {
    const isUp = keys.includes('up')
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    const viewRows = table.getRowModel().rows // ソートやフィルタが実施された後の現在表示されている行情報を取得

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
  }

  // 選択行の表示順を上下に移動
  function hotkeysModUpDown(keys: readonly string[]) {
    if (!canPositonChange()) return
    const isUp = keys.includes('up')
    const targetRow = table.getSelectedRowModel().rows[0]
    if (!targetRow) return

    // ソートやフィルタが実施された後の現在表示されている行情報を取得
    const viewRows = table.getRowModel().rows

    // 表示順に並んでいるviewRowsの中から選択行のindexを取得
    // nowSelectedRow.indexの値は、ソート前のデータのindex
    const targetIndex = viewRows.findIndex((data) => data.id === targetRow.id)
    const toIndex = isUp ? targetIndex - 1 : targetIndex + 1
    const toRow = table.getRowModel().rows[toIndex]
    if (!toRow) return
    updateTaskPosition(targetRow.index, toRow.index)
  }

  // 選択行を編集
  function hotkeysModEnter() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return
    openTaskDialog(nowSelectedRow.original)
  }

  // 選択行を削除
  function hotkeysModDelete() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return
    openDeleteTaskDialog(nowSelectedRow.original)
  }

  const hotkeysRef = useHotkeys<HTMLTableElement>(
    [
      'up',
      'down',
      'mod+up',
      'mod+down',
      'alt+up',
      'alt+down',
      'mod+enter',
      'alt+enter',
      'mod+delete',
      'mod+backspace',
      'alt+delete',
      'alt+backspace',
    ],
    (_, handler) => {
      if (isLoading) return // ローディング中は何もしない

      switch (handler.keys?.join('')) {
        case 'up':
        case 'down':
          handler.mod || handler.alt
            ? hotkeysModUpDown(handler.keys)
            : hotkeysUpDown(handler.keys)
          break
        case 'enter':
          hotkeysModEnter()
          break
        case 'delete':
        case 'backspace':
          hotkeysModDelete()
          break
      }
    },
    { preventDefault: true },
  )

  // タスク追加ダイアログを開く
  useHotkeys(['mod+i', 'alt+i'], () => {
    if (isLoading || isOpenUpsertDialog || isOpenDeleteDialog) return // ローディング中、ダイアログが開いている場合は何もしない
    openTaskDialog()
  })

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  // モーダルを閉じた時にテーブルにフォーカスを移動
  React.useEffect(() => {
    if (isOpenUpsertDialog || isOpenDeleteDialog) return
    hotkeysRef.current?.focus({ preventScroll: true })
  }, [isOpenUpsertDialog, isOpenDeleteDialog, hotkeysRef])

  // タスクデータが変更されたらテーブルデータを更新
  React.useEffect(() => {
    setTableData(tasks)
  }, [tasks])

  // 選択行が変更されたらフォーカスを移動
  React.useEffect(() => {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return
    hotkeysRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus()
    // hotkeysRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }, [rowSelection, hotkeysRef, table])

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      cancelDrop={() => {
        return !canPositonChange()
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        clearSortToast()
      }}
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
          <Table ref={hotkeysRef} tabIndex={0} className="focus:outline-none">
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
