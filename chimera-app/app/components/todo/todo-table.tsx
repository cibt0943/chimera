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
import { TaskStatus } from '~/types/tasks'
import { ViewTodo, ViewTodos } from '~/types/view-todos'
import { TodoTableToolbar } from './todo-table-toolbar'
import { TodoTableColumns } from './todo-table-columns'
import {
  TodoDeleteConfirmDialog,
  TodoDeleteConfirmDialogProps,
} from './todo-delete-confirm-dialog'
import { useUserAgentAtom } from '~/lib/global-state'

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    moveTodo: (viewTodo: TData, isUp: boolean) => void
    updateTodoStatus: (viewTodo: TData) => void
    editTodo: (viewTodo: TData) => void
    deleteTodo: (viewTodo: TData) => void
  }
}

interface TodoTableProps {
  originalTodos: ViewTodo[]
  showId: string
}

const PAGE_SIZE = 20
const DEFAULT_COLUMN_FILTERS: ColumnFiltersState = [
  { id: 'status', value: [0, 2] },
]

export function TodoTable({ originalTodos, showId }: TodoTableProps) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()
  const { enqueue } = useApiQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isLoading = useIsLoading()

  // tanstack/react-table
  const [viewTodos, setViewTodos] = React.useState<ViewTodos>(originalTodos)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    DEFAULT_COLUMN_FILTERS,
  )
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({
    [showId]: true,
  })
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  // 編集・削除するタスク
  const [actionViewTodo, setActionViewTodo] = React.useState<ViewTodo>()

  // 削除用ダイアログの表示・非表示
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // tbody要素参照用
  const tBodyRef = React.useRef<HTMLTableSectionElement>(null)

  const hotkeysEnabled = !(isLoading || isOpenDeleteDialog || showId)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const table = useReactTable({
    data: viewTodos,
    columns: TodoTableColumns,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.todoId,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      moveTodo: moveTodoOneStep,
      updateTodoStatus: updateTodoStatusApi,
      editTodo: (viewTodo: ViewTodo) => {
        navigate(viewTodo.todoId)
      },
      deleteTodo: openDeleteTodoDialog,
    },
  })

  // タスクデータが変更されたらテーブルデータを更新
  React.useEffect(() => {
    setViewTodos(originalTodos)
  }, [originalTodos])

  // 選択行にフォーカスを設定
  React.useEffect(() => {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && setListFocus(nowSelectedRow.original)
  }, [table, rowSelection])

  // タスク追加ダイアログを開く
  function openAddTaskDialog() {
    navigate('task')
  }

  // タスクバー追加ダイアログを開く
  function openAddTodoBarDialog() {
    navigate('bar')
  }

  // タスク削除ダイアログを開く
  function openDeleteTodoDialog(viewTodo: ViewTodo) {
    setActionViewTodo(viewTodo)
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
  function canMoveTodo() {
    // ソート中は並び順を変更できない
    return sorting.length == 0
  }

  // 並び順を変更できないか否か
  function cannotMoveTodo() {
    return !canMoveTodo()
  }

  // ドラッグ&ドロップによるタスクの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    // ソートやフィルタが実施されていないリストからインデックス情報を取得
    const fromViewTodo = viewTodos.find((data) => data.todoId === active.id)
    const toViewTodo = viewTodos.find((data) => data.todoId === over?.id)
    if (!fromViewTodo || !toViewTodo) return
    moveViewTodo(fromViewTodo, toViewTodo)
  }

  // タスクの表示順を変更
  function moveViewTodo(fromViewTodo: ViewTodo, toViewTodo: ViewTodo) {
    setViewTodos((prev) => {
      // フィルタリング前のタスクデータ(tableData)からfromとtoのindexを取得し順番を入れ替える
      const fromIndex = prev.findIndex(
        (data) => data.todoId === fromViewTodo.todoId,
      )
      const toIndex = prev.findIndex(
        (data) => data.todoId === toViewTodo.todoId,
      )
      return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
    })

    // 選択行を変更
    setRowSelection({ [fromViewTodo.todoId]: true })

    // タスクの表示順変更API
    moveTodoApiDebounce(fromViewTodo, toViewTodo)
  }

  // タスクの表示順変更API呼び出し
  async function moveTodoApi(fromViewTodo: ViewTodo, toViewTodo: ViewTodo) {
    try {
      // useFetcherのsubmitを利用すると自動でタスクデータを再取得してしまうのであえてfetchを利用
      const url = `${API_URL}${TODO_URL}/${fromViewTodo.todoId}/position`
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ toTodoId: toViewTodo.todoId }),
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
  const moveTodoApiDebounce = useDebounce((fromViewTodo, toViewTodo) => {
    enqueue(() => moveTodoApi(fromViewTodo, toViewTodo))
  }, 300)

  // タスクの表示順を1ステップ変更
  function moveTodoOneStep(targetViewTodo: ViewTodo, isUp: boolean) {
    if (cannotMoveTodo()) {
      clearSortToast()
      return
    }
    // ソートやフィルタが実施された後の現在表示されている行情報を取得
    const viewRows = table.getRowModel().rows
    // 表示順に並んでいるviewRowsの中から選択行のindexを取得
    // nowSelectedRow.indexの値は、ソート前のデータのindex
    const fromIndex = viewRows.findIndex(
      (data) => data.id === targetViewTodo.todoId,
    )
    const fromRow = viewRows[fromIndex]
    if (!fromRow) return
    const toIndex = isUp ? fromIndex - 1 : fromIndex + 1
    const toRow = viewRows[toIndex]
    if (!toRow) return
    moveViewTodo(fromRow.original, toRow.original)
  }

  // 選択行の表示順を1ステップ変更
  function moveSelectedTodoOneStep(isUp: boolean) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && moveTodoOneStep(nowSelectedRow.original, isUp)
  }

  // タスクのステータス変更APIの呼び出し
  function updateTodoStatusApi(viewTodo: ViewTodo) {
    // タスクのステータス変更API
    fetcher
      .submit(
        { status: viewTodo.status },
        {
          action: `${API_URL}${TODO_URL}/${viewTodo.todoId}`,
          method: 'post',
          encType: 'application/json',
        },
      )
      .then(() => {
        toast.info(t('task.message.changed_status'))
      })
  }

  // 選択行のステータスを変更
  function updateSelectedTodoStatus(status: TaskStatus) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow || nowSelectedRow.original.status === status) return
    const updateViewTodo = { ...nowSelectedRow.original, status }
    updateTodoStatusApi(updateViewTodo)
  }

  // 選択行を編集
  function showSelectedTodoEdit() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && navigate(nowSelectedRow.original.todoId)
  }

  // 選択行を削除
  function deleteSelectedTodo() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && openDeleteTodoDialog(nowSelectedRow.original)
  }

  // 指定タスクへフォーカスを設定
  function setListFocus(viewTodo: ViewTodo) {
    tBodyRef.current
      ?.querySelector<HTMLElement>(`#row-${viewTodo.todoId}`)
      ?.focus()
    // tBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }

  // テーブルにフォーカスを設定
  function changeSelectedTodoOneStep(isUp: boolean) {
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
  useTodoTableScopedHotkeys({
    modifierKey: userAgent.modifierKey,
    enabled: hotkeysEnabled,
    showSelectedTodoEdit,
    changeSelectedTodoOneStep,
    moveSelectedTodoOneStep,
    updateSelectedTodoStatus,
    deleteSelectedTodo,
  })

  useTodoTableGlobalHotkeys({
    modifierKey: userAgent.modifierKey,
    enabled: hotkeysEnabled,
    openAddTaskDialog,
    changeSelectedTodoOneStep,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="h-8 px-3"
          onClick={openAddTaskDialog}
        >
          <LuPlus />
          {t('task.message.task_creation')}
          <p className="text-muted-foreground hidden text-xs sm:block">
            <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 select-none">
              <span>{userAgent.modifierKeyIcon}</span>n
            </kbd>
          </p>
        </Button>
        <Button
          variant="secondary"
          className="h-8 px-3"
          onClick={openAddTodoBarDialog}
        >
          <LuPlus />
          {t('todoBar.message.todo_bar_creation')}
        </Button>
        <TodoTableToolbar table={table} />
      </div>
      <div className="rounded-md border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          cancelDrop={cannotMoveTodo}
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
                items={viewTodos.map((todo) => todo.todoId)}
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
      <TodoDeleteConfirmDialogMemo
        viewTodo={actionViewTodo}
        redirectUrl={TODO_URL}
        isOpen={isOpenDeleteDialog}
        onOpenChange={setIsOpenDeleteDialog}
      />
    </div>
  )
}

function useTodoTableScopedHotkeys(params: {
  modifierKey: string
  enabled: boolean
  showSelectedTodoEdit: () => void
  changeSelectedTodoOneStep: (isUp: boolean) => void
  moveSelectedTodoOneStep: (isUp: boolean) => void
  updateSelectedTodoStatus: (status: TaskStatus) => void
  deleteSelectedTodo: () => void
}) {
  const {
    modifierKey,
    enabled,
    showSelectedTodoEdit,
    changeSelectedTodoOneStep,
    moveSelectedTodoOneStep,
    updateSelectedTodoStatus,
    deleteSelectedTodo,
  } = params

  const HOTKEYS = {
    ENTER: 'enter',
    UP: 'up',
    DOWN: 'down',
    MODIFIER_UP: `${modifierKey}+up`,
    MODIFIER_DOWN: `${modifierKey}+down`,
    MODIFIER_1: `${modifierKey}+1`,
    MODIFIER_2: `${modifierKey}+2`,
    MODIFIER_3: `${modifierKey}+3`,
    MODIFIER_4: `${modifierKey}+4`,
    MODIFIER_DELETE: `${modifierKey}+delete`,
    MODIFIER_BACKSPACE: `${modifierKey}+backspace`,
  }

  useHotkeys(
    Object.values(HOTKEYS),
    (_, { hotkey }) => {
      switch (hotkey) {
        case HOTKEYS.ENTER:
          showSelectedTodoEdit()
          break
        case HOTKEYS.UP:
          changeSelectedTodoOneStep(true)
          break
        case HOTKEYS.MODIFIER_UP:
          moveSelectedTodoOneStep(true)
          break
        case HOTKEYS.DOWN:
          changeSelectedTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_DOWN:
          moveSelectedTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_1:
          updateSelectedTodoStatus(TaskStatus.NEW)
          break
        case HOTKEYS.MODIFIER_2:
          updateSelectedTodoStatus(TaskStatus.DOING)
          break
        case HOTKEYS.MODIFIER_3:
          updateSelectedTodoStatus(TaskStatus.DONE)
          break
        case HOTKEYS.MODIFIER_4:
          updateSelectedTodoStatus(TaskStatus.PENDING)
          break
        case HOTKEYS.MODIFIER_DELETE:
        case HOTKEYS.MODIFIER_BACKSPACE:
          deleteSelectedTodo()
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (e) => {
        const target = e.target as HTMLElement
        return !['tr', 'body'].includes(target.tagName.toLowerCase())
      },
      enabled,
    },
  )
}

function useTodoTableGlobalHotkeys(params: {
  modifierKey: string
  enabled: boolean
  openAddTaskDialog: () => void
  changeSelectedTodoOneStep: (isUp: boolean) => void
}) {
  const { modifierKey, enabled, openAddTaskDialog, changeSelectedTodoOneStep } =
    params

  useHotkeys(
    [`${modifierKey}+n`, `${modifierKey}+left`, `${modifierKey}+right`],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        case 'n':
          openAddTaskDialog()
          break
        case 'left': {
          changeSelectedTodoOneStep(true)
          break
        }
        case 'right': {
          changeSelectedTodoOneStep(false)
          break
        }
      }
    },
    { enabled },
  )
}

// D&D用の行コンポーネント
function DraggableRow({ row }: { row: Row<ViewTodo> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.todoId,
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
const TodoDeleteConfirmDialogMemo = React.memo(
  (props: TodoDeleteConfirmDialogProps) => {
    return <TodoDeleteConfirmDialog {...props} />
  },
)
TodoDeleteConfirmDialogMemo.displayName = 'TodoDeleteConfirmDialogMemo'
