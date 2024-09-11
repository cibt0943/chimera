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
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
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
import { API_URL, TODO_URL } from '~/constants'
import { useDebounce, useApiQueue, useIsLoading } from '~/lib/hooks'
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
  showId: string
}

export function TodoTable({ defaultTasks, showId }: TodoTableProps<Task>) {
  const { t } = useTranslation()
  const { enqueue } = useApiQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const { toast } = useToast()
  const isLoading = useIsLoading()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

  // 編集・削除するタスク
  const [actionTask, setActionTask] = React.useState<Task>()

  // 追加用ダイアログの表示・非表示
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState(false)

  // 削除用ダイアログの表示・非表示
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // tbody要素参照用
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
  }, [defaultTasks])

  // 選択行にフォーカスを設定
  React.useEffect(() => {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && setListFocus(nowSelectedRow.original)
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

  // 並び順を変更できないか否か
  function cannotMoveTask() {
    return !canMoveTask()
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
      navigate('.', { replace: true })
    }
  }

  // タスクの表示順変更API呼び出し
  async function moveTaskApi(fromTask: Task, toTask: Task) {
    // useFetcherのsubmitを利用すると自動でタスクデータを再取得してしまうのであえてfetchを利用
    const url = [TODO_URL, fromTask.id, 'position'].join('/')
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ toTaskId: toTask.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update position api')
      }
    })
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

  // タスクの表示順を1ステップ変更
  function moveTaskOneStep(targetTask: Task, isUp: boolean) {
    if (cannotMoveTask()) {
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
        action: [API_URL, TODO_URL, '/' + updateTask.id].join(''),
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

  // 指定タスクへフォーカスを設定
  function setListFocus(task: Task) {
    useTBodyRef.current?.querySelector<HTMLElement>(`#row-${task.id}`)?.focus()
    // useTBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }

  // キーボードショートカット
  useHotkeys(
    [
      'enter',
      'up',
      'down',
      'alt+up',
      'alt+down',
      'alt+1',
      'alt+2',
      'alt+3',
      'alt+4',
      'alt+delete',
      'alt+backspace',
    ],
    (_, handler) => {
      // ローディング中、ダイアログが開いている場合は何もしない
      if (isLoading || isOpenAddDialog || isOpenDeleteDialog || showId) return

      switch (handler.keys?.join('')) {
        case 'enter':
          showSelectedTaskEdit()
          break
        case 'up':
        case 'down':
          handler.alt
            ? moveSelectedTaskOneStep(handler.keys.includes('up'))
            : changeSelectedRowOneStep(handler.keys.includes('up'))
          break
        case '1':
          updateSelectedTaskStatus(TaskStatus.NEW)
          break
        case '2':
          updateSelectedTaskStatus(TaskStatus.DOING)
          break
        case '3':
          updateSelectedTaskStatus(TaskStatus.DONE)
          break
        case '4':
          updateSelectedTaskStatus(TaskStatus.PENDING)
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
  useHotkeys(['alt+n'], () => {
    // ローディング中、ダイアログが開いている場合は何もしない
    if (isLoading || isOpenAddDialog || isOpenDeleteDialog || showId) return

    openAddTaskDialog()
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          className="h-8 px-3"
          onClick={() => openAddTaskDialog()}
        >
          <RiAddLine className="mr-2" />
          {t('common.message.add')}
          <p className="ml-2 hidden text-xs text-muted-foreground sm:block">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
              <span>⌥</span>n
            </kbd>
          </p>
        </Button>
        <TodoTableToolbar table={table} />
      </div>
      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          cancelDrop={cannotMoveTask}
          onDragEnd={handleDragEnd}
          onDragCancel={clearSortToast}
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
      <TaskFormDialogMemo
        task={undefined}
        isOpen={isOpenAddDialog}
        setIsOpen={setIsOpenAddDialog}
        returnUrl={TODO_URL}
      />
      <TaskDeleteConfirmDialogMemo
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
      id={`row-${row.id}`}
      ref={setNodeRef}
      tabIndex={0}
      // className="outline-none"
      className="rounded outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
      style={style}
      onFocus={() => row.toggleSelected(true)}
      data-state={row.getIsSelected() && 'selected'}
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
const TaskFormDialogMemo = React.memo((props: TaskFormDialogProps) => {
  return <TaskFormDialog {...props} />
})
TaskFormDialogMemo.displayName = 'TaskFormDialogMemo'

// タスク削除ダイアログのメモ化
const TaskDeleteConfirmDialogMemo = React.memo(
  (props: TaskDeleteConfirmDialogProps) => {
    return <TaskDeleteConfirmDialog {...props} />
  },
)
TaskDeleteConfirmDialogMemo.displayName = 'TaskDeleteConfirmDialogMemo'
