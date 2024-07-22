import * as React from 'react'
import { useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RiAddLine } from 'react-icons/ri'
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
import { TaskFormDialog, TaskFormDialogProps } from './task-form-dialog'
import {
  TaskDeleteConfirmDialog,
  TaskDeleteConfirmDialogProps,
} from './task-delete-confirm-dialog'

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    moveTask: (task: TData, isUp: boolean) => void
    updateTaskStatus: (task: TData) => void
    editTask: (task: TData) => void
    deleteTask: (task: TData) => void
  }
}

interface TodoTableProps<TData extends RowData> {
  defaultTasks: TData[]
  tasksLoadDate: Date
  showId: string
}

export function TodoTable({
  defaultTasks,
  tasksLoadDate,
  showId,
}: TodoTableProps<Task>) {
  const { t } = useTranslation()
  const { enqueue } = useQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const { toast } = useToast()
  const isLoading = useIsLoading()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  // tanstack/react-table
  const [tableData, setTableData] = React.useState<Tasks>(defaultTasks)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([
    { id: 'status', value: [0, 2] },
  ])

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({
    [showId]: true,
  })
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const [tasksLastLoadDate, setTasksLastLoadDate] =
    React.useState(tasksLoadDate)
  const [actionTask, setActionTask] = React.useState<Task>() // 編集・削除するタスク
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState(false)
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const useTBodyRef = React.useRef<HTMLTableSectionElement>(null)

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
      moveTask: (task: Task, isUp: boolean) => {
        moveTaskOneStep(task, isUp)
      },
      updateTaskStatus: (updateTask: Task) => {
        updateTaskStatusApi(updateTask)
      },
      editTask: (task: Task) => {
        navigate(task.id.toString())
      },
      deleteTask: (task: Task) => {
        openDeleteTaskDialog(task)
      },
    },
  })

  // タスクデータが変更されたらテーブルデータを更新
  React.useEffect(() => {
    setTableData(defaultTasks)
    setTasksLastLoadDate(tasksLoadDate)
  }, [tasksLoadDate > tasksLastLoadDate])

  // 選択行にフォーカスを設定
  React.useEffect(() => {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow) return
    useTBodyRef.current
      ?.querySelector<HTMLElement>(`#row-${nowSelectedRow.id}`)
      ?.focus()
    // useTBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }, [table, rowSelection])

  // タスク追加ダイアログを開く
  function openAddTaskDialog() {
    setIsOpenAddDialog(true)
  }

  // タスク削除ダイアログを開く
  function openDeleteTaskDialog(task: Task) {
    setActionTask(task)
    setIsOpenDeleteDialog(true)
  }

  // 並び順を変更できない場合のトースト表示
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
  function canMoveTask() {
    // ソート中は並び順を変更できない
    return sorting.length == 0
  }

  // ドラッグ&ドロップによるタスクの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    // ソートやフィルタが実施されていないリストからインデックス情報を取得
    const fromTask = tableData.find((data) => data.id === active.id)
    const toTask = tableData.find((data) => data.id === over?.id)
    if (!fromTask || !toTask) return
    moveTask(fromTask, toTask)
  }

  // タスクの表示順変更APIをdebounce
  const moveTaskApiDebounce = useDebounce((fromTask, toTask) => {
    enqueue(() =>
      moveTaskApi(fromTask, toTask).catch((error) => {
        alert(error.message)
        navigate('.?refresh=true', { replace: true })
      }),
    )
  }, 300)

  // タスクの表示順変更APIの呼び出し
  async function moveTaskApi(fromTask: Task, toTask: Task) {
    // fetcher.submitを利用すると自動でメモデータを再取得してしまうのであえてfetchを利用
    await fetch(`/todos/${fromTask.id}/position`, {
      method: 'POST',
      body: JSON.stringify({ toTaskId: toTask.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update position api')
      }
    })
  }

  // タスクの表示順を変更
  function moveTask(fromTask: Task, toTask: Task) {
    try {
      setTableData((prev) => {
        // フィルタリング前のタスクデータ(tableData)からfromとtoのindexを取得し順番を入れ替える
        const fromIndex = prev.findIndex((data) => data.id === fromTask.id)
        const toIndex = prev.findIndex((data) => data.id === toTask.id)
        return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
      })

      // これによりフォーカスがD&D用のつまみから行全体に移動する
      setRowSelection({ [fromTask.id]: true })

      // タスクの表示順変更API
      moveTaskApiDebounce(fromTask, toTask)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      alert(msg)
      navigate('.?refresh=true', { replace: true })
    }
  }

  // タスクの表示順を1ステップ変更
  function moveTaskOneStep(targetTask: Task, isUp: boolean) {
    if (!canMoveTask()) {
      clearSortToast()
      return
    }
    // ソートやフィルタが実施された後の現在表示されている行情報を取得
    const viewRows = table.getRowModel().rows
    // 表示順に並んでいるviewRowsの中から選択行のindexを取得
    // nowSelectedRow.indexの値は、ソート前のデータのindex
    const fromIndex = viewRows.findIndex((data) => data.id === targetTask.id)
    const fromRow = viewRows[fromIndex]
    if (!fromRow) return
    const toIndex = isUp ? fromIndex - 1 : fromIndex + 1
    const toRow = viewRows[toIndex]
    if (!toRow) return
    moveTask(fromRow.original, toRow.original)
  }

  // 選択行の表示順を1ステップ変更
  function moveSelectedTaskOneStep(isUp: boolean) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && moveTaskOneStep(nowSelectedRow.original, isUp)
  }

  // 選択行を1ステップ変更
  function changeSelectedRowOneStep(isUp: boolean) {
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
    nextSelectedRow?.toggleSelected(true)
  }

  // タスクのステータス変更APIの呼び出し
  function updateTaskStatusApi(updateTask: Task) {
    // タスクのステータス変更API
    fetcher.submit(
      { status: updateTask.status },
      {
        action: `/todos/${updateTask.id}/status`,
        method: 'post',
      },
    )
  }

  // 選択行のステータスを変更
  function updateSelectedTaskStatus(status: TaskStatus) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow || nowSelectedRow.original.status === status) return
    const updateTask = { ...nowSelectedRow.original, status }
    updateTaskStatusApi(updateTask)
  }

  // 選択行を編集
  function showSelectedTaskEdit() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && navigate(nowSelectedRow.original.id.toString())
  }

  // 選択行を削除
  function deleteSelectedTask() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && openDeleteTaskDialog(nowSelectedRow.original)
  }

  // キーボードショートカット
  useHotkeys(
    [
      'up',
      'down',
      'alt+up',
      'alt+down',
      'enter',
      'alt+enter',
      'alt+delete',
      'alt+backspace',
    ],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        case 'up':
        case 'down':
          handler.alt
            ? moveSelectedTaskOneStep(handler.keys.includes('up'))
            : changeSelectedRowOneStep(handler.keys.includes('up'))
          break
        case 'enter':
          handler.alt
            ? updateSelectedTaskStatus(TaskStatus.DONE)
            : showSelectedTaskEdit()
          break
        case 'delete':
        case 'backspace':
          deleteSelectedTask()
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (e) => {
        const target = e.target as HTMLElement
        return !['tr', 'body'].includes(target.tagName.toLowerCase())
      },
    },
  )

  // タスク追加ダイアログを開く
  useHotkeys(['alt+i'], () => {
    // ローディング中、ダイアログが開いている場合は何もしない
    if (isLoading || isOpenAddDialog || isOpenDeleteDialog || showId) return
    openAddTaskDialog()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          className="h-8 px-2 lg:px-3"
          onClick={() => openAddTaskDialog()}
        >
          <RiAddLine className="mr-2" />
          {t('common.message.add')}
          <p className="text-xs text-muted-foreground ml-2">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
              <span>⌥</span>i
            </kbd>
          </p>
        </Button>
        <TodoTableToolbar table={table} />
      </div>
      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          cancelDrop={() => {
            return !canMoveTask()
          }}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            clearSortToast()
          }}
          sensors={sensors}
          id="dnd-context-for-todo-table"
        >
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
            <TableBody ref={useTBodyRef}>
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
        </DndContext>
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
      <AddTaskFormDialogMemo
        task={undefined}
        isOpen={isOpenAddDialog}
        setIsOpen={setIsOpenAddDialog}
      />
      <DeleteConfirmTaskDialogMemo
        task={actionTask}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
      />
    </div>
  )
}

// D&D用の行コンポーネント
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
      tabIndex={0}
      id={`row-${row.id}`}
      className="outline-none data-[state=selected]:bg-blue-100 dark:data-[state=selected]:bg-slate-700"
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

// タスク追加ダイアログのメモ化
const AddTaskFormDialogMemo = React.memo((props: TaskFormDialogProps) => {
  return <TaskFormDialog {...props} />
})
AddTaskFormDialogMemo.displayName = 'AddTaskFormDialogMemo'

// タスク削除ダイアログのメモ化
const DeleteConfirmTaskDialogMemo = React.memo(
  (props: TaskDeleteConfirmDialogProps) => {
    return <TaskDeleteConfirmDialog {...props} />
  },
)
DeleteConfirmTaskDialogMemo.displayName = 'DeleteConfirmTaskDialogMemo'
