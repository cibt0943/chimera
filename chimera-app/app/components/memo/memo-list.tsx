import * as React from 'react'
import { RxPlus } from 'react-icons/rx'
import { Form, useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { useDebounce, useQueue } from '~/lib/utils'
import { Memos, Memo } from '~/types/memos'
import { ListIterm } from './memo-list-item'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

interface MemoListProps {
  defaultMemos: Memos
  showId: string
}

export function MemoList({ defaultMemos, showId }: MemoListProps) {
  const { t } = useTranslation()
  const { enqueue } = useQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {}),
  )

  const showMemo = defaultMemos.find((memo) => memo.id === showId)

  const [dispMemos, setDispMemos] = React.useState(defaultMemos)
  const [actionMemo, setActionMemo] = React.useState(showMemo) // 編集・削除するメモ
  const [focusedMemo, setFocusedMemo] = React.useState(showMemo) // 一覧でフォーカスしているメモ
  const [selectedMemo, setSelectedMemo] = React.useState(showMemo) // 一覧で選択しているメモ
  const [filter, setFilter] = React.useState('') // フィルタリング文字列
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  const memosRefs = React.useRef<HTMLDivElement>(null)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  // 選択＆フォーカスメモの更新
  React.useEffect(() => {
    if (showMemo?.id === selectedMemo?.id) return
    setSelectedMemo(showMemo)
    setFocusedMemo(showMemo)
  }, [showMemo, selectedMemo])

  // メモ一覧のフィルタリング
  React.useEffect(() => {
    if (fetcher.state !== 'idle') return
    const dispMemos = defaultMemos.filter((memo) =>
      memo.title.toLowerCase().includes(filter),
    )
    setDispMemos(dispMemos)
  }, [filter, defaultMemos, fetcher.state])

  // focusedMemoに合わせてフォーカスを設定
  React.useEffect(() => {
    if (!focusedMemo) return
    memosRefs.current
      ?.querySelector<HTMLElement>(`#memo-${focusedMemo.id}`)
      ?.focus()
  }, [focusedMemo])

  // フォーカス移動
  useHotkeys(['up', 'down'], (_, handler) => {
    if (!dispMemos.length || !focusedMemo) return
    const isUp = handler.keys?.includes('up')
    const nowIndex = dispMemos.findIndex((memo) => memo.id === focusedMemo.id)
    const toIndex = isUp ? nowIndex - 1 : nowIndex + 1
    if (toIndex < 0 || toIndex >= dispMemos.length) return
    setFocusedMemo(dispMemos[toIndex])
  })

  // メモ追加
  useHotkeys(['mod+i', 'alt+i'], () => {
    addButtonRef.current?.click()
  })

  // メモ削除
  useHotkeys(
    ['mod+delete', 'alt+delete', 'mod+backspace', 'alt+backspace'],
    () => {
      if (!selectedMemo) return
      handleDeleteMemo(selectedMemo)
    },
  )

  // メモ一覧をフィルタリング
  async function filterMemos(searchTerm: string) {
    setFilter(searchTerm.toLowerCase())
  }
  const filterMemosDebounce = useDebounce((searchTerm) => {
    enqueue(() => filterMemos(searchTerm))
  }, 300)

  function handleDeleteMemo(memo: Memo) {
    setActionMemo(memo)
    setIsOpenDeleteDialog(true)
  }

  // 行のドラッグ&ドロップによるメモの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // フィルタ等を行っているリスト(dispMemos)を元に表示順更新対象のメモのインデックスを取得
      const fromIndex = dispMemos.findIndex((memo) => memo.id === active.id)
      const toIndex = dispMemos.findIndex((memo) => memo.id === over.id)
      updateMemoPosition(fromIndex, toIndex)
    }
  }

  // メモの表示順を更新APIをdebounce
  const updateMemoPositionApiDebounce = useDebounce((fromMemo, toMemo) => {
    enqueue(() =>
      updateMemoPositionApi(fromMemo, toMemo).catch((error) => {
        alert(error.message)
        navigate('.', { replace: true })
      }),
    )
  }, 300)

  // メモの表示順更新APIの呼び出し
  async function updateMemoPositionApi(fromMemo: Memo, toMemo: Memo) {
    fetcher.submit(
      { toMemoId: toMemo.id },
      {
        action: `/memos/${fromMemo.id}/position`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  // メモの表示順を更新
  function updateMemoPosition(fromIndex: number, toIndex: number) {
    try {
      // フィルタ等を行っているリスト(dispMemos)を元に表示順更新対象のメモを取得
      const fromMemo = dispMemos[fromIndex]
      const toMemo = dispMemos[toIndex]
      if (!fromMemo || !toMemo) {
        throw new Error('Failed to update position')
      }

      setDispMemos((prev) => {
        return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
      })

      // メモの表示順を更新API
      updateMemoPositionApiDebounce(fromMemo, toMemo)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      alert(msg)
      navigate('.', { replace: true })
    }
  }

  return (
    <div className="space-y-4 px-1 py-4">
      <div className="flex items-center space-x-2 px-3">
        <Input
          type="search"
          placeholder={t('memo.message.title_filter')}
          onChange={(event) => {
            filterMemosDebounce(event.target.value)
          }}
          className="h-8"
          id="memos-title-filter"
        />
        <Form action={`/memos`} method="post">
          <Button
            type="submit"
            variant="secondary"
            className="h-8 px-2 lg:px-3"
            ref={addButtonRef}
          >
            <RxPlus className="mr-2" />
            {t('common.message.add')}
            <p className="text-[10px] text-muted-foreground ml-2">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 text-muted-foreground">
                <span className="text-xs">⌘</span>i
              </kbd>
            </p>
          </Button>
        </Form>
      </div>
      <ScrollArea className="h-[calc(100vh_-_110px)]">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="space-y-3 px-3" id="memos" ref={memosRefs}>
            <SortableContext
              items={dispMemos}
              strategy={verticalListSortingStrategy}
            >
              {dispMemos.length ? (
                dispMemos.map((item: Memo) => (
                  <ListIterm
                    key={item.id}
                    item={item}
                    handleDeleteMemo={handleDeleteMemo}
                    setFocusedMemo={setFocusedMemo}
                    isSelected={item.id === selectedMemo?.id}
                  />
                ))
              ) : (
                <div className="text-sm">{t('common.message.no_data')}</div>
              )}
            </SortableContext>
          </div>
        </DndContext>
      </ScrollArea>
      {actionMemo ? (
        <MemoDeleteConfirmDialog
          memo={actionMemo}
          isOpenDialog={isOpenDeleteDialog}
          setIsOpenDialog={setIsOpenDeleteDialog}
        />
      ) : null}
    </div>
  )
}
