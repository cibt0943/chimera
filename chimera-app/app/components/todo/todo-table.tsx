import * as React from 'react'
import { useNavigate, useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
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
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { API_URL, TODO_URL } from '~/constants'
import { useDebounce, useApiQueue, useIsLoading } from '~/lib/hooks'
import { Task, Tasks, TaskStatus } from '~/types/tasks'
import { TodoTableToolbar } from './todo-table-toolbar'
import { TodoTableColumns } from './todo-table-columns'
import {
  TaskDeleteConfirmDialog,
  TaskDeleteConfirmDialogProps,
} from './task-delete-confirm-dialog'
import { useUserAgentAtom } from '~/lib/global-state'
declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    moveTask: (task: TData, isUp: boolean) => void
    updateTaskStatus: (task: TData) => void
    editTask: (task: TData) => void
    deleteTask: (task: TData) => void
  }
}

interface TodoTableProps<TData extends RowData> {
  originalTasks: TData[]
  showId: string
}

export function TodoTable({ originalTasks, showId }: TodoTableProps<Task>) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()
  const { enqueue } = useApiQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isLoading = useIsLoading()
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // tanstack/react-table
  const [tasks, setTasks] = React.useState<Tasks>(originalTasks)
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

  // 削除用ダイアログの表示・非表示
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // tbody要素参照用
  const tBodyRef = React.useRef<HTMLTableSectionElement>(null)

  const table = useReactTable({
    data: tasks,
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
    setTasks(originalTasks)
  }, [originalTasks])

  // 選択行にフォーカスを設定
  React.useEffect(() => {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && setListFocus(nowSelectedRow.original)
  }, [table, rowSelection])

  // タスク追加ダイアログを開く
  function openAddTaskDialog() {
    navigate('new')
  }

  // タスク削除ダイアログを開く
  function openDeleteTaskDialog(task: Task) {
    setActionTask(task)
    setIsOpenDeleteDialog(true)
  }

  // 並び順を変更できない場合のトースト表示
  function clearSortToast() {
    toast.warning(t('common.message.order_cannot_changed_sorting'), {
      duration: 8000,
      description: t('common.message.clear_sort?'),
      action: {
        label: t('common.message.clear'),
        onClick: () => {
          table.resetSorting()
        },
      },
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
    const fromTask = tasks.find((data) => data.id === active.id)
    const toTask = tasks.find((data) => data.id === over?.id)
    if (!fromTask || !toTask) return
    moveTask(fromTask, toTask)
  }

  // タスクの表示順を変更
  function moveTask(fromTask: Task, toTask: Task) {
    setTasks((prev) => {
      // フィルタリング前のタスクデータ(tableData)からfromとtoのindexを取得し順番を入れ替える
      const fromIndex = prev.findIndex((data) => data.id === fromTask.id)
      const toIndex = prev.findIndex((data) => data.id === toTask.id)
      return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
    })

    // 選択行を変更
    setRowSelection({ [fromTask.id]: true })

    // タスクの表示順変更API
    moveTaskApiDebounce(fromTask, toTask)
  }

  // タスクの表示順変更API呼び出し
  async function moveTaskApi(fromTask: Task, toTask: Task) {
    try {
      // useFetcherのsubmitを利用すると自動でタスクデータを再取得してしまうのであえてfetchを利用
      const url = `${API_URL}${TODO_URL}/${fromTask.id}/position`
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ toTaskId: toTask.id }),
      })

      if (!response.ok) throw new Error('Failed to update position api')
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
        navigate('.', { replace: true })
      }
    }
  }

  // タスクの表示順変更APIをdebounce
  const moveTaskApiDebounce = useDebounce((fromTask, toTask) => {
    enqueue(() => moveTaskApi(fromTask, toTask))
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

  // タスクのステータス変更APIの呼び出し
  function updateTaskStatusApi(task: Task) {
    // タスクのステータス変更API
    fetcher
      .submit(
        { status: task.status },
        {
          action: `${API_URL}${TODO_URL}/${task.id}`,
          method: 'post',
          encType: 'application/json',
        },
      )
      .then(() => {
        toast.info(t('task.message.changed_status'))
      })
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
    tBodyRef.current?.querySelector<HTMLElement>(`#row-${task.id}`)?.focus()
    // tBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }

  // テーブルにフォーカスを設定
  function changeSelectedTaskOneStep(isUp: boolean) {
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

  // キーボードショートカット(スコープあり)
  const HOTKEYS = {
    ENTER: 'enter',
    UP: 'up',
    DOWN: 'down',
    MODIFIER_UP: `${userAgent.modifierKey}+up`,
    MODIFIER_DOWN: `${userAgent.modifierKey}+down`,
    MODIFIER_1: `${userAgent.modifierKey}+1`,
    MODIFIER_2: `${userAgent.modifierKey}+2`,
    MODIFIER_3: `${userAgent.modifierKey}+3`,
    MODIFIER_4: `${userAgent.modifierKey}+4`,
    MODIFIER_DELETE: `${userAgent.modifierKey}+delete`,
    MODIFIER_BACKSPACE: `${userAgent.modifierKey}+backspace`,
  }

  useHotkeys(
    Object.values(HOTKEYS),
    (_, { hotkey }) => {
      switch (hotkey) {
        case HOTKEYS.ENTER:
          showSelectedTaskEdit()
          break
        case HOTKEYS.UP:
          changeSelectedTaskOneStep(true)
          break
        case HOTKEYS.MODIFIER_UP:
          moveSelectedTaskOneStep(true)
          break
        case HOTKEYS.DOWN:
          changeSelectedTaskOneStep(false)
          break
        case HOTKEYS.MODIFIER_DOWN:
          moveSelectedTaskOneStep(false)
          break
        case HOTKEYS.MODIFIER_1:
          updateSelectedTaskStatus(TaskStatus.NEW)
          break
        case HOTKEYS.MODIFIER_2:
          updateSelectedTaskStatus(TaskStatus.DOING)
          break
        case HOTKEYS.MODIFIER_3:
          updateSelectedTaskStatus(TaskStatus.DONE)
          break
        case HOTKEYS.MODIFIER_4:
          updateSelectedTaskStatus(TaskStatus.PENDING)
          break
        case HOTKEYS.MODIFIER_DELETE:
        case HOTKEYS.MODIFIER_BACKSPACE:
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
      // ローディング中、ダイアログが開いている場合は何もしない
      enabled: !(isLoading || isOpenDeleteDialog || showId),
    },
  )

  // キーボードショートカット(スコープなし)
  useHotkeys(
    [
      `${userAgent.modifierKey}+n`,
      `${userAgent.modifierKey}+left`,
      `${userAgent.modifierKey}+right`,
    ],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        // タスク追加ダイアログを開く
        case 'n':
          openAddTaskDialog()
          break
        // フォーカスを一覧へ移動
        case 'left': {
          changeSelectedTaskOneStep(true)
          break
        }
        case 'right': {
          changeSelectedTaskOneStep(false)
          break
        }
      }
    },
    {
      // ローディング中、ダイアログが開いている場合は何もしない
      enabled: !(isLoading || isOpenDeleteDialog || showId),
    },
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="h-8 px-3"
          onClick={() => openAddTaskDialog()}
        >
          <LuPlus />
          {t('common.message.add')}
          <p className="text-muted-foreground hidden text-xs sm:block">
            <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 select-none">
              <span>{userAgent.modifierKeyIcon}</span>n
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
            <TableBody ref={tBodyRef}>
              <SortableContext
                items={tasks}
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
      <div className="flex items-center justify-end gap-2">
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
      <TaskDeleteConfirmDialogMemo
        task={actionTask}
        redirectUrl={TODO_URL}
        isOpen={isOpenDeleteDialog}
        onOpenChange={setIsOpenDeleteDialog}
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
      className="focus:ring-ring rounded outline-hidden focus:ring-1 focus:ring-inset"
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

// タスク削除ダイアログのメモ化
const TaskDeleteConfirmDialogMemo = React.memo(
  (props: TaskDeleteConfirmDialogProps) => {
    return <TaskDeleteConfirmDialog {...props} />
  },
)
TaskDeleteConfirmDialogMemo.displayName = 'TaskDeleteConfirmDialogMemo'
