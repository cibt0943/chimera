import * as React from 'react'
import { RxPlus } from 'react-icons/rx'
import { Form, useNavigate } from '@remix-run/react'
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
import { MemoActions } from './memo-actions'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

interface MemoListProps {
  defaultMemos: Memos
  showId: string
  memosLoadDate: Date
}

export function MemoList({
  defaultMemos,
  showId,
  memosLoadDate,
}: MemoListProps) {
  const { t } = useTranslation()
  const { enqueue: filterEnqueue } = useQueue()
  const { enqueue: positionEnqueue } = useQueue()
  const navigate = useNavigate()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {}),
  )

  const [memos, setMemos] = React.useState(defaultMemos)
  const [memosLastLoadDate, setMemosLastLoadDate] =
    React.useState(memosLoadDate)
  const [filter, setFilter] = React.useState('') // フィルタリング文字列
  const [actionMemo, setActionMemo] = React.useState<Memo>() // 編集・削除するメモ
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  const memosRefs = React.useRef<HTMLDivElement>(null)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  // フィルタリング前のメモ一覧データ更新
  React.useEffect(() => {
    setMemos(defaultMemos)
    setMemosLastLoadDate(memosLoadDate)
  }, [memosLoadDate > memosLastLoadDate])

  // フィルタリング後のメモ一覧データ更新（memosに依存した値なのでstateで持つ必要はないと考えメモ化した変数で対応）
  const dispMemos = React.useMemo(() => {
    if (!filter) return memos
    return memos.filter((memo) => memo.title.toLowerCase().includes(filter))
  }, [memos, filter])

  // 一覧で選択しているメモ（選択行はpropsのshowIdで特定されるためstateで持つ必要はないと考えメモ化した変数で対応）
  const selectedMemo = React.useMemo(() => {
    return memos.find((memo) => memo.id === showId)
  }, [memos, showId])

  const [focusedMemo, setFocusedMemo] = React.useState(selectedMemo) // 一覧でフォーカスしているメモ

  // focusedMemoに合わせてフォーカスを設定
  React.useEffect(() => {
    if (!focusedMemo) return
    memosRefs.current
      ?.querySelector<HTMLElement>(`#memo-${focusedMemo.id}`)
      ?.focus()
  }, [focusedMemo])

  // キーボード操作
  useHotkeys(
    [
      'up',
      'down',
      'mod+i',
      'alt+i',
      'mod+up',
      'alt+up',
      'mod+down',
      'alt+down',
      'mod+delete',
      'alt+delete',
      'mod+backspace',
      'alt+backspace',
    ],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        // フォーカス移動
        case 'up':
        case 'down':
          handler.mod || handler.alt
            ? keyUpDownMemoPosition(handler.keys)
            : keyUpDownMemoFocus(handler.keys)
          break
        // メモ追加
        case 'i':
          addButtonRef.current?.click()
          break
        // メモ削除
        case 'delete':
        case 'backspace':
          if (!selectedMemo) return
          openDeleteMemoDialog(selectedMemo)
          break
      }
    },
  )

  // メモ一覧をフィルタリング
  async function filterMemos(searchTerm: string) {
    setFilter(searchTerm.toLowerCase())
  }
  const filterMemosDebounce = useDebounce((searchTerm) => {
    filterEnqueue(() => filterMemos(searchTerm))
  }, 300)

  // 上下キーによるフォーカス移動
  function keyUpDownMemoFocus(keys: readonly string[]) {
    if (!focusedMemo) return
    const isUp = keys?.includes('up')
    const nowIndex = dispMemos.findIndex((memo) => memo.id === focusedMemo.id)
    const toIndex = isUp ? nowIndex - 1 : nowIndex + 1
    if (toIndex < 0 || toIndex >= dispMemos.length) return
    setFocusedMemo(dispMemos[toIndex])
  }

  // 上下キーによる表示順移動
  function keyUpDownMemoPosition(keys: readonly string[]) {
    if (!selectedMemo) return
    const isUp = keys?.includes('up')
    updateMemoPositionOneStep(selectedMemo, isUp)
  }

  // メモの表示順を1つ移動
  function updateMemoPositionOneStep(targetMemo: Memo, isUp: boolean) {
    // フィルタリング後のメモデータ(dispMemos)を元に表示順更新対象のメモを取得
    const fromIndex = dispMemos.findIndex((memo) => targetMemo.id === memo.id)
    const toIndex = isUp ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= dispMemos.length) return
    updateMemoPosition(targetMemo, dispMemos[toIndex])
  }

  // メモ削除確認ダイアログ表示
  function openDeleteMemoDialog(memo: Memo) {
    setActionMemo(memo)
    setIsOpenDeleteDialog(true)
  }

  // 行のドラッグ&ドロップによるメモの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // フィルタリング後のメモデータ(dispMemos)を元に表示順更新対象のメモを取得
      const fromMemo = dispMemos.find((memo) => memo.id === active.id)
      const toMemo = dispMemos.find((memo) => memo.id === over.id)
      if (!fromMemo || !toMemo) return
      updateMemoPosition(fromMemo, toMemo)
    }
  }

  // メモの表示順を更新APIをdebounce
  const updateMemoPositionApiDebounce = useDebounce((fromMemo, toMemo) => {
    positionEnqueue(() =>
      updateMemoPositionApi(fromMemo, toMemo).catch((error) => {
        alert(error.message)
        navigate('.', { replace: true })
      }),
    )
  }, 300)

  // メモの表示順更新APIの呼び出し
  async function updateMemoPositionApi(fromMemo: Memo, toMemo: Memo) {
    // fetcher.submitを利用すると自動でメモデータを再取得してしまうのであえてfetchを利用
    await fetch(`/memos/${fromMemo.id}/position`, {
      method: 'POST',
      body: JSON.stringify({ toMemoId: toMemo.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update position api')
      }
    })
  }

  // メモの表示順を更新
  function updateMemoPosition(fromMemo: Memo, toMemo: Memo) {
    try {
      if (!fromMemo || !toMemo) {
        throw new Error('Failed to update position')
      }

      setMemos((prev) => {
        // フィルタリング前のメモデータ(memos)からfromとtoのindexを取得し順番を入れ替える
        const fromIndex = prev.findIndex((memo) => memo.id === fromMemo.id)
        const toIndex = prev.findIndex((memo) => memo.id === toMemo.id)
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
                    setFocusedMemo={setFocusedMemo}
                    isSelected={item.id === selectedMemo?.id}
                    actionComponent={
                      <MemoActions
                        memo={item}
                        handleUpdateMemoPosition={updateMemoPositionOneStep}
                        handleDeleteMemo={openDeleteMemoDialog}
                      />
                    }
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
