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
    moveViewTodo: (viewTodo: TData, isUp: boolean) => void
    updateViewTodoStatus: (viewTodo: TData) => void
    editViewTodo: (viewTodo: TData) => void
    deleteViewTodo: (viewTodo: TData) => void
  }
}

interface TodoTableProps<TData extends RowData> {
  originalTodos: TData[]
  showId: string
}

export function TodoTable({ originalTodos, showId }: TodoTableProps<ViewTodo>) {
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
  const [viewTodos, setViewTodos] = React.useState<ViewTodos>(originalTodos)
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
  const [actionViewTodo, setActionViewTodo] = React.useState<ViewTodo>()

  // 削除用ダイアログの表示・非表示
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // tbody要素参照用
  const tBodyRef = React.useRef<HTMLTableSectionElement>(null)

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
      moveViewTodo: (viewTodo: ViewTodo, isUp: boolean) => {
        moveViewTodoOneStep(viewTodo, isUp)
      },
      updateViewTodoStatus: (updateViewTodo: ViewTodo) => {
        updateViewTodoStatusApi(updateViewTodo)
      },
      editViewTodo: (viewTodo: ViewTodo) => {
        navigate(viewTodo.id.toString())
      },
      deleteViewTodo: (viewTodo: ViewTodo) => {
        openDeleteViewTodoDialog(viewTodo)
      },
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
  function openAddViewTodoDialog() {
    navigate('new')
  }

  // タスク削除ダイアログを開く
  function openDeleteViewTodoDialog(viewTodo: ViewTodo) {
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
  function canMoveViewTodo() {
    // ソート中は並び順を変更できない
    return sorting.length == 0
  }

  // 並び順を変更できないか否か
  function cannotMoveViewTodo() {
    return !canMoveViewTodo()
  }

  // ドラッグ&ドロップによるタスクの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    // ソートやフィルタが実施されていないリストからインデックス情報を取得
    const fromViewTodo = viewTodos.find((data) => data.id === active.id)
    const toViewTodo = viewTodos.find((data) => data.id === over?.id)
    if (!fromViewTodo || !toViewTodo) return
    moveViewTodo(fromViewTodo, toViewTodo)
  }

  // タスクの表示順を変更
  function moveViewTodo(fromViewTodo: ViewTodo, toViewTodo: ViewTodo) {
    setViewTodos((prev) => {
      // フィルタリング前のタスクデータ(tableData)からfromとtoのindexを取得し順番を入れ替える
      const fromIndex = prev.findIndex((data) => data.id === fromViewTodo.id)
      const toIndex = prev.findIndex((data) => data.id === toViewTodo.id)
      return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
    })

    // 選択行を変更
    setRowSelection({ [fromViewTodo.id]: true })

    // タスクの表示順変更API
    moveViewTodoApiDebounce(fromViewTodo, toViewTodo)
  }

  // タスクの表示順変更API呼び出し
  async function moveViewTodoApi(fromViewTodo: ViewTodo, toViewTodo: ViewTodo) {
    try {
      // useFetcherのsubmitを利用すると自動でタスクデータを再取得してしまうのであえてfetchを利用
      const url = `${API_URL}${TODO_URL}/${fromViewTodo.id}/position`
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ toViewTodoId: toViewTodo.id }),
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
  const moveViewTodoApiDebounce = useDebounce((fromViewTodo, toViewTodo) => {
    enqueue(() => moveViewTodoApi(fromViewTodo, toViewTodo))
  }, 300)

  // タスクの表示順を1ステップ変更
  function moveViewTodoOneStep(targetViewTodo: ViewTodo, isUp: boolean) {
    if (cannotMoveViewTodo()) {
      clearSortToast()
      return
    }
    // ソートやフィルタが実施された後の現在表示されている行情報を取得
    const viewRows = table.getRowModel().rows
    // 表示順に並んでいるviewRowsの中から選択行のindexを取得
    // nowSelectedRow.indexの値は、ソート前のデータのindex
    const fromIndex = viewRows.findIndex(
      (data) => data.id === targetViewTodo.id,
    )
    const fromRow = viewRows[fromIndex]
    if (!fromRow) return
    const toIndex = isUp ? fromIndex - 1 : fromIndex + 1
    const toRow = viewRows[toIndex]
    if (!toRow) return
    moveViewTodo(fromRow.original, toRow.original)
  }

  // 選択行の表示順を1ステップ変更
  function moveSelectedViewTodoOneStep(isUp: boolean) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && moveViewTodoOneStep(nowSelectedRow.original, isUp)
  }

  // タスクのステータス変更APIの呼び出し
  function updateViewTodoStatusApi(viewTodo: ViewTodo) {
    // タスクのステータス変更API
    fetcher
      .submit(
        { status: viewTodo.status },
        {
          action: `${API_URL}${TODO_URL}/${viewTodo.id}`,
          method: 'post',
          encType: 'application/json',
        },
      )
      .then(() => {
        toast.info(t('task.message.changed_status'))
      })
  }

  // 選択行のステータスを変更
  function updateSelectedViewTodoStatus(status: TaskStatus) {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    if (!nowSelectedRow || nowSelectedRow.original.status === status) return
    const updateViewTodo = { ...nowSelectedRow.original, status }
    updateViewTodoStatusApi(updateViewTodo)
  }

  // 選択行を編集
  function showSelectedViewTodoEdit() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && navigate(nowSelectedRow.original.id.toString())
  }

  // 選択行を削除
  function deleteSelectedViewTodo() {
    const nowSelectedRow = table.getSelectedRowModel().rows[0]
    nowSelectedRow && openDeleteViewTodoDialog(nowSelectedRow.original)
  }

  // 指定タスクへフォーカスを設定
  function setListFocus(viewTodo: ViewTodo) {
    tBodyRef.current?.querySelector<HTMLElement>(`#row-${viewTodo.id}`)?.focus()
    // tBodyRef.current?.querySelector(`#row-${nowSelectedRow.id}`)?.focus({ preventScroll: true })
  }

  // テーブルにフォーカスを設定
  function changeSelectedViewTodoOneStep(isUp: boolean) {
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
          showSelectedViewTodoEdit()
          break
        case HOTKEYS.UP:
          changeSelectedViewTodoOneStep(true)
          break
        case HOTKEYS.MODIFIER_UP:
          moveSelectedViewTodoOneStep(true)
          break
        case HOTKEYS.DOWN:
          changeSelectedViewTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_DOWN:
          moveSelectedViewTodoOneStep(false)
          break
        case HOTKEYS.MODIFIER_1:
          updateSelectedViewTodoStatus(TaskStatus.NEW)
          break
        case HOTKEYS.MODIFIER_2:
          updateSelectedViewTodoStatus(TaskStatus.DOING)
          break
        case HOTKEYS.MODIFIER_3:
          updateSelectedViewTodoStatus(TaskStatus.DONE)
          break
        case HOTKEYS.MODIFIER_4:
          updateSelectedViewTodoStatus(TaskStatus.PENDING)
          break
        case HOTKEYS.MODIFIER_DELETE:
        case HOTKEYS.MODIFIER_BACKSPACE:
          deleteSelectedViewTodo()
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
          openAddViewTodoDialog()
          break
        // フォーカスを一覧へ移動
        case 'left': {
          changeSelectedViewTodoOneStep(true)
          break
        }
        case 'right': {
          changeSelectedViewTodoOneStep(false)
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
          onClick={() => openAddViewTodoDialog()}
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
          cancelDrop={cannotMoveViewTodo}
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
                items={viewTodos}
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
      <ViewTodoDeleteConfirmDialogMemo
        viewTodo={actionViewTodo}
        redirectUrl={TODO_URL}
        isOpen={isOpenDeleteDialog}
        onOpenChange={setIsOpenDeleteDialog}
      />
    </div>
  )
}

// D&D用の行コンポーネント
function DraggableRow({ row }: { row: Row<ViewTodo> }) {
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
const ViewTodoDeleteConfirmDialogMemo = React.memo(
  (props: TodoDeleteConfirmDialogProps) => {
    return <TodoDeleteConfirmDialog {...props} />
  },
)
ViewTodoDeleteConfirmDialogMemo.displayName = 'ViewTodoDeleteConfirmDialogMemo'
