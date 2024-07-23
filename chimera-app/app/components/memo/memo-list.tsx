import * as React from 'react'
import { Form, useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RiAddLine } from 'react-icons/ri'
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
import { Memos, Memo, MemoStatus } from '~/types/memos'
import { ListItem } from './memo-list-item'
import { MemoActions } from './memo-actions'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'
import { MemoSettings } from './memo-settings'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

interface MemoListProps {
  defaultMemos: Memos
  showId: string
}

export function MemoList({ defaultMemos, showId }: MemoListProps) {
  const { t } = useTranslation()
  const { enqueue: searchEnqueue } = useQueue()
  const { enqueue: moveMemoEnqueue } = useQueue()
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

  const memoSettings = useAtomValue(memoSettingsAtom)
  const [memos, setMemos] = React.useState(defaultMemos)
  const [searchTerm, setSearchTerm] = React.useState('') // 検索文字列
  const [actionMemo, setActionMemo] = React.useState<Memo>() // 編集・削除するメモ
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  const memosRefs = React.useRef<HTMLDivElement>(null)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  // フィルタリング前のメモ一覧データ更新
  React.useEffect(() => {
    setMemos(defaultMemos)
  }, [defaultMemos])

  // フィルタリング後のメモ一覧データ更新（memosに依存した値なのでstateで持つ必要はないと考えメモ化した変数で対応）
  const dispMemos = React.useMemo(() => {
    if (!searchTerm) return memos
    return memos.filter((memo) => memo.title.toLowerCase().includes(searchTerm))
  }, [memos, searchTerm])

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
      'alt+up',
      'alt+down',
      'alt+enter',
      'alt+delete',
      'alt+backspace',
    ],
    (_, handler) => {
      // ダイアログが開いている場合は何もしない
      if (isOpenDeleteDialog) return
      switch (handler.keys?.join('')) {
        // フォーカスの行移動
        case 'up':
        case 'down':
          handler.alt
            ? moveSelectedMemoOneStep(handler.keys.includes('up'))
            : changeFocusedMemoOneStep(handler.keys.includes('up'))
          break
        // メモ追加
        case 'i':
          addButtonRef.current?.click()
          break
        // メモのアーカイブ
        case 'enter':
          updateSeletedMemoStatus()
          break
        // メモ削除
        case 'delete':
        case 'backspace':
          if (!selectedMemo) return
          openDeleteMemoDialog(selectedMemo)
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (e) => {
        const target = e.target as HTMLElement
        return !['a', 'body'].includes(target.tagName.toLowerCase())
      },
    },
  )

  // メモ追加
  useHotkeys(['alt+i'], () => {
    addButtonRef.current?.click()
  })

  // メモ一覧を検索
  async function searchMemos(searchTerm: string) {
    setSearchTerm(searchTerm.toLowerCase())
  }
  const searchMemosDebounce = useDebounce((searchTerm) => {
    searchEnqueue(() => searchMemos(searchTerm))
  }, 300)

  // フォーカスを1ステップ変更
  function changeFocusedMemoOneStep(isUp: boolean) {
    let targetIndex = 0
    if (focusedMemo) {
      const nowIndex = dispMemos.findIndex((memo) => memo.id === focusedMemo.id)
      targetIndex = isUp ? nowIndex - 1 : nowIndex + 1
    }
    if (targetIndex < 0 || targetIndex >= dispMemos.length) return
    setFocusedMemo(dispMemos[targetIndex])
  }

  // 選択行の表示順を1ステップ変更
  function moveSelectedMemoOneStep(isUp: boolean) {
    selectedMemo && moveMemoOneStep(selectedMemo, isUp)
  }

  // メモの表示順を1ステップ変更
  function moveMemoOneStep(targetMemo: Memo, isUp: boolean) {
    // フィルタリング後のメモデータ(dispMemos)を元に表示順更新対象のメモを取得
    const fromIndex = dispMemos.findIndex((memo) => targetMemo.id === memo.id)
    const toIndex = isUp ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= dispMemos.length) return
    moveMemo(targetMemo, dispMemos[toIndex])
  }

  // 選択行のステータスを変更
  function updateSeletedMemoStatus() {
    if (!selectedMemo) return
    const status =
      selectedMemo.status === MemoStatus.NOMAL
        ? MemoStatus.ARCHIVED
        : MemoStatus.NOMAL
    updateMemoStatusApi({ ...selectedMemo, status })
  }

  // メモのステータスを変更
  function updateMemoStatusApi(memo: Memo) {
    fetcher.submit(
      { status: memo.status },
      {
        action: `/memos/${memo.id}/status`,
        method: 'post',
      },
    )
  }

  // メモ削除ダイアログを開く
  function openDeleteMemoDialog(memo: Memo) {
    setActionMemo(memo)
    setIsOpenDeleteDialog(true)
  }

  // ドラッグ&ドロップによるメモの表示順変更
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // フィルタリング後のメモデータ(dispMemos)を元に表示順更新対象のメモを取得
      const fromMemo = dispMemos.find((memo) => memo.id === active.id)
      const toMemo = dispMemos.find((memo) => memo.id === over.id)
      if (!fromMemo || !toMemo) return
      moveMemo(fromMemo, toMemo)
    }
  }

  // メモの表示順変更APIをdebounce
  const moveMemoApiDebounce = useDebounce((fromMemo, toMemo) => {
    moveMemoEnqueue(() =>
      moveMemoApi(fromMemo, toMemo).catch((error) => {
        alert(error.message)
        navigate('.?refresh=true', { replace: true })
      }),
    )
  }, 300)

  // メモの表示順変更APIの呼び出し
  async function moveMemoApi(fromMemo: Memo, toMemo: Memo) {
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

  // メモの表示順を変更
  function moveMemo(fromMemo: Memo, toMemo: Memo) {
    try {
      setMemos((prev) => {
        // フィルタリング前のメモデータ(memos)からfromとtoのindexを取得し順番を入れ替える
        const fromIndex = prev.findIndex((memo) => memo.id === fromMemo.id)
        const toIndex = prev.findIndex((memo) => memo.id === toMemo.id)
        return arrayMove(prev, fromIndex, toIndex) //this is just a splice util
      })

      // メモの表示順変更API
      moveMemoApiDebounce(fromMemo, toMemo)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error'
      alert(msg)
      navigate('.?refresh=true', { replace: true })
    }
  }

  return (
    <div className="space-y-4 px-1 py-4">
      <div className="flex items-center space-x-2 px-3">
        <Form action={`/memos`} method="post">
          <Button
            type="submit"
            variant="secondary"
            className="h-8 px-2"
            ref={addButtonRef}
          >
            <RiAddLine className="mr-2" />
            {t('common.message.add')}
            <p className="text-xs text-muted-foreground ml-2">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
                <span>⌥</span>i
              </kbd>
            </p>
          </Button>
        </Form>
        <Input
          type="search"
          placeholder={t('memo.message.title_search')}
          onChange={(event) => {
            searchMemosDebounce(event.target.value)
          }}
          className="h-8"
          id="memos-title-search"
        />
        <MemoSettings />
      </div>
      <ScrollArea className="h-[calc(100vh_-_115px)]">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id="dnd-context-for-memos"
        >
          <div className="space-y-3 px-3" id="memos" ref={memosRefs}>
            <SortableContext
              items={dispMemos}
              strategy={verticalListSortingStrategy}
            >
              {dispMemos.length ? (
                dispMemos.map((item: Memo) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    setFocusedMemo={setFocusedMemo}
                    isSelected={item.id === selectedMemo?.id}
                    isDisplayPreview={!!memoSettings?.list_display.content}
                  >
                    <MemoActions
                      memo={item}
                      handleMoveMemo={moveMemoOneStep}
                      handleUpdateMemoStatus={updateMemoStatusApi}
                      handleDeleteMemo={openDeleteMemoDialog}
                    />
                  </ListItem>
                ))
              ) : (
                <div className="text-sm">{t('common.message.no_data')}</div>
              )}
            </SortableContext>
          </div>
        </DndContext>
      </ScrollArea>
      {actionMemo && (
        <MemoDeleteConfirmDialog
          memo={actionMemo}
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
        />
      )}
    </div>
  )
}
