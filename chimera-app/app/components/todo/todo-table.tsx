import * as React from 'react'
import { useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RxPlus } from 'react-icons/rx'
import {
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
import { Task, Tasks, TaskStatus } from '~/types/tasks'
import { TodoTableToolbar } from './todo-table-toolbar'
import { TodoTableColumns } from './todo-table-columns'
import { TaskFormDialog } from './task-form-dialog'
import { TaskDeleteConfirmDialog } from './task-delete-confirm-dialog'

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    updateTaskPosition: (task: TData, isUp: boolean) => void
    updateTaskStatus: (task: TData, status: TaskStatus) => void
    editTask: (task: TData) => void
    deleteTask: (task: TData) => void
  }
}

interface TodoTableProps<TData extends RowData> {
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
      onFocus={() => {
        row.toggleSelected(true)
      }}
      onClick={() => {
        row.toggleSelected(true)
      }}
      tabIndex={0}
      id={`row-${row.id}`}
      className="outline-none data-[state=selected]:bg-blue-100"
      // className="outline-none"
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
export function TodoTable({ tasks }: TodoTableProps<Task>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { enqueue } = useQueue()
  const isLoading = useIsLoading()

  // tanstack/react-table
  const [tableData, setTableData] = React.useState<Tasks>(tasks)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'status', value: [0, 2] },
  ])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState(false)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task>() // 編集・削除するタスク
  const useTBodyRef = React.useRef<HTMLTableSectionElement>(null)

  const fetcher = useFetcher()

  const table = useReactTable({
    data: tableData,
    columns: TodoTableColumns,
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
      updateTaskPosition: (task: Task, isUp: boolean) => {
        // ソートやフィルタが実施された後の現在表示されている行情報を取得
        const viewRows = table.getRowModel().rows
        // 表示順に並んでいるviewRowsの中から選択行のindexを取得
        const targetIndex = viewRows.findIndex(
          (data) => data.id === task.id.toString(),
        )
        const toIndex = isUp ? targetIndex - 1 : targetIndex + 1
        const toRow = table.getRowModel().rows[toIndex]
        if (!toRow) return
        const targetRow = table.getRowModel().rows[targetIndex]
        // タスクの表示順を更新
        updateTaskPosition(targetRow.index, toRow.index)
      },
      updateTaskStatus: (task: Task, status: TaskStatus) => {
        // タスクのステータスを変更API
        fetcher.submit(
          { status: status },
          {
            action: `/todos/${task.id}/status`,
            method: 'post',
          },
        )
      },
      editTask: (task: Task) => {
        navigate(task.id.toString())
      },
      deleteTask: (task: Task) => {
        openDeleteTaskDialog(task)
      },
    },
  })

  // タスク追加ダイアログを開く
  function openAddTaskDialog() {
    setSelectedTask(undefined)
    setIsOpenAddDialog(true)
  }

  // タスク削除ダイアログを開く
  function openDeleteTaskDialog(task: Task) {
    setSelectedTask(task)
    setIsOpenDeleteDialog(true)
  }

  // タスク追加ダイアログ
  function AddTaskDialog() {
    return (
      <TaskFormDialog
        task={undefined}
        isOpen={isOpenAddDialog}
        setIsOpen={setIsOpenAddDialog}
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
          {t('common.message.order_cannot_changed_sorting')}
          <br />
          {t('common.message.clear_sort?')}
        </div>
      ),
      action: (
        <ToastAction
          altText={t('common.message.clear_sorting')}
          onClick={() => {
            table.resetSorting()
          }}
        >
          {t('common.message.clear')}
        </ToastAction>
      ),
    })
  }

  // 並び順を変更できるか否か
  function canPositonChange() {
    // ソート中は並び順を変更できない
    return sorting.length == 0
  }

  // 行のドラッグ&ドロップによるタスクの表示順変更
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
    enqueue(() =>
      updateTaskPositionApi(fromTask, toTask).catch((error) => {
        alert(error.message)
        navigate('.', { replace: true })
      }),
    )
  }, 300)

  // タスクの表示順更新APIの呼び出し
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
    }
  }

  // 選択行を上下に移動
  function keyUpDownSelectedRow(keys: readonly string[]) {
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
  function keyUpDownTaskPosition(keys: readonly string[]) {
    if (!canPositonChange()) return
    const targetRow = table.getSelectedRowModel().rows[0]
    if (!targetRow) return

    const isUp = keys.includes('up')
    // ソートやフィルタが実施された後の現在表示されている行情報を取得
    const viewRows = table.getRowModel().rows
    // 表示順に並んでいるviewRowsの中から選択行のindexを取得
    // nowSelectedRow.indexの値は、ソート前のデータのindex
    const targetIndex = viewRows.findIndex((data) => data.id === targetRow.id)
    const toIndex = isUp ? targetIndex - 1 : targetIndex + 1
    const toRow = table.getRowModel().rows[toIndex]
    if (!toRow) return

    // タスクの表示順を更新
    updateTaskPosition(targetRow.index, toRow.index)
  }

  // 選択行を完了させる
  function keyUpdateTaskStatus(status: TaskStatus) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return

    table.options.meta?.updateTaskStatus(nowSelectedRow.original, status)
  }

  // 選択行を編集
  function keyEditTask() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return
    navigate(nowSelectedRow.original.id.toString())
  }

  // 選択行を削除
  function keyDeleteTask() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return

    openDeleteTaskDialog(nowSelectedRow.original)
  }

  useHotkeys<HTMLTableElement>(
    [
      'up',
      'down',
      'mod+up',
      'mod+down',
      'alt+up',
      'alt+down',
      'mod+c',
      'alt+c',
      'enter',
      'mod+enter',
      'alt+enter',
      'mod+delete',
      'alt+delete',
      'mod+backspace',
      'alt+backspace',
    ],
    (_, handler) => {
      // ローディング中、ダイアログが開いている場合は何もしない
      if (isLoading || isOpenAddDialog || isOpenDeleteDialog) return
      switch (handler.keys?.join('')) {
        case 'up':
        case 'down':
          handler.mod || handler.alt
            ? keyUpDownTaskPosition(handler.keys)
            : keyUpDownSelectedRow(handler.keys)
          break
        case 'c':
          keyUpdateTaskStatus(TaskStatus.DONE)
          break
        case 'enter':
          keyEditTask()
          break
        case 'delete':
        case 'backspace':
          keyDeleteTask()
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (e) => {
        const pressedKeys = e.key.toLowerCase()
        const target = e.target as HTMLElement
        switch (pressedKeys) {
          case 'enter':
            return !['tr', 'body'].includes(target.tagName.toLowerCase())
          case 'arrowup':
          case 'arrowdown':
            return !['tr', 'tbody', 'body'].includes(
              target.tagName.toLowerCase(),
            )
          default:
            return false
        }
      },
    },
  )

  // タスク追加ダイアログを開く
  useHotkeys(['mod+i', 'alt+i'], () => {
    // ローディング中、ダイアログが開いている場合は何もしない
    if (isLoading || isOpenAddDialog || isOpenDeleteDialog) return
    openAddTaskDialog()
  })

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  // タスクデータが変更されたらテーブルデータを更新
  React.useEffect(() => {
    setTableData(tasks)
  }, [tasks, table])

  // 選択行が変更された時とモーダルを閉じた時にテーブルにフォーカスを移動
  React.useEffect(() => {
    if (isOpenDeleteDialog || isOpenAddDialog) return
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) {
      useTBodyRef.current?.focus()
      return
    }
    useTBodyRef.current
      ?.querySelector<HTMLElement>(`#row-${nowSelectedRow.id}`)
      ?.focus()
    // useTBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }, [useTBodyRef, table, rowSelection, isOpenAddDialog, isOpenDeleteDialog])

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
            onClick={() => openAddTaskDialog()}
          >
            <RxPlus className="mr-2" />
            {t('common.message.add')}
            <p className="text-[10px] text-muted-foreground ml-2">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 text-muted-foreground">
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
            <TableBody
              ref={useTBodyRef}
              // tabIndex={0}
              // className="focus:outline-none"
            >
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
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      {t('common.message.no_data')}
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
            {t('common.message.prev')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={table.nextPage}
            disabled={!table.getCanNextPage()}
          >
            {t('common.message.next')}
          </Button>
        </div>
        <AddTaskDialog />
        <DeleteConfirmTaskDialog />
      </div>
    </DndContext>
  )
}
