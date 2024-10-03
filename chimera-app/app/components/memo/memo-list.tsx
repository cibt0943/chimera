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
import { API_URL, MEMO_URL } from '~/constants'
import { useDebounce, useApiQueue } from '~/lib/hooks'
import { Memos, Memo, MemoStatus } from '~/types/memos'
import { MemoSettings } from '~/types/memo-settings'
import { ListItem } from './memo-list-item'
import { MemoActionMenu } from './memo-action-menu'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'
import { MemoSettingsForm } from './memo-settings-form'
import { getModifierKeyInfo } from '~/lib/utils'
import { useUserAgentAtom } from '~/lib/global-state'

interface MemoListProps {
  defaultMemos: Memos
  showId: string
  memoSettings: MemoSettings
}

export function MemoList({
  defaultMemos,
  showId,
  memoSettings,
}: MemoListProps) {
  const { t } = useTranslation()
  const userAgent = useUserAgentAtom()
  const { modifierKey, modifierKeyIcon } = getModifierKeyInfo(userAgent.OS)
  const { enqueue: searchEnqueue } = useApiQueue()
  const { enqueue: moveMemoEnqueue } = useApiQueue()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 1000,
        tolerance: 10,
      },
    }),
  )

  // メモ一覧データ
  const [memos, setMemos] = React.useState(defaultMemos)

  // 一覧で選択しているメモ
  const [selectedMemo, setSelectedMemo] = React.useState<Memo>()

  // 一覧でフォーカスしているメモ
  const [focusedMemo, setFocusedMemo] = React.useState<Memo>()

  // 検索文字列
  const [searchTerm, setSearchTerm] = React.useState('')

  // 編集・削除するメモ
  const [actionMemo, setActionMemo] = React.useState<Memo>()

  // 削除用ダイアログの表示・非表示
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // メモ一覧要素参照用
  const useMemosRef = React.useRef<HTMLDivElement>(null)

  // メモ追加ボタン参照用
  const useAddButtonRef = React.useRef<HTMLButtonElement>(null)

  // フィルタリング後のメモ一覧データ
  const dispMemos = React.useMemo(() => {
    if (!searchTerm) return memos
    return memos.filter((memo) => memo.title.toLowerCase().includes(searchTerm))
  }, [memos, searchTerm])

  // フィルタリング前のメモ一覧データ更新
  React.useEffect(() => {
    setMemos(defaultMemos)
  }, [defaultMemos])

  // F5でリロードされた場合に選択行のフォーカスを設定
  const targetId = showId ? showId : selectedMemo?.id
  React.useEffect(() => {
    const selectMemo = memos.find((memo) => memo.id === targetId)
    setSelectedMemo(selectMemo)
    setFocusedMemo(selectMemo)
    setListFocus(selectMemo)
    // 以下のdisableを止める方法を検討したい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId])

  // メモ一覧の検索
  async function searchMemos(searchTerm: string) {
    setSearchTerm(searchTerm.toLowerCase())
  }

  // メモ一覧の検索をdebounce
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
    if (!dispMemos[targetIndex]) return
    setFocusedMemo(dispMemos[targetIndex])
    setListFocus(dispMemos[targetIndex])
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
    if (!dispMemos[toIndex]) return
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
        action: [API_URL, MEMO_URL, '/' + memo.id].join(''),
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
      navigate('.', { replace: true })
    }
  }

  // メモの表示順変更API呼び出し
  async function moveMemoApi(fromMemo: Memo, toMemo: Memo) {
    // fetcher.submitを利用すると自動でメモデータを再取得してしまうのであえてfetchを利用
    const url = [MEMO_URL, fromMemo.id, 'position'].join('/')
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ toMemoId: toMemo.id }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error('Failed to update position api')
      }
    })
  }

  // メモの表示順変更APIをdebounce
  const moveMemoApiDebounce = useDebounce((fromMemo, toMemo) => {
    moveMemoEnqueue(() =>
      moveMemoApi(fromMemo, toMemo).catch((error) => {
        alert(error.message)
        navigate('.', { replace: true })
      }),
    )
  }, 300)

  // 指定メモへフォーカスを設定
  function setListFocus(memo: Memo | undefined, force = false) {
    const targetMemo = memo ? memo : force ? dispMemos[0] : undefined
    targetMemo &&
      useMemosRef.current
        ?.querySelector<HTMLElement>(`#memo-${targetMemo.id}`)
        ?.focus()
  }

  // キーボード操作(スコープあり)
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
      switch (handler.keys?.join('')) {
        // フォーカス上下or表示順上下の1ステップ移動
        case 'up':
        case 'down':
          handler.alt
            ? moveSelectedMemoOneStep(handler.keys.includes('up'))
            : changeFocusedMemoOneStep(handler.keys.includes('up'))
          break
        // メモのアーカイブ
        case 'enter':
          updateSeletedMemoStatus()
          break
        // メモ削除
        case 'delete':
        case 'backspace':
          selectedMemo && openDeleteMemoDialog(selectedMemo)
          break
      }
    },
    {
      preventDefault: true,
      ignoreEventWhen: (event) => {
        // ダイアログが開いている場合は何もしない
        if (isOpenDeleteDialog) return true
        const target = event.target as HTMLElement
        const tagName = target.tagName.toLowerCase()
        if (tagName === 'body') return false
        return tagName !== 'a' || target.getAttribute('role') !== 'listitem'
      },
    },
  )

  // キーボード操作(スコープなし)
  useHotkeys(
    ['alt+n', `${modifierKey}+left`],
    (_, handler) => {
      switch (handler.keys?.join('')) {
        // メモ追加
        case 'n':
          useAddButtonRef.current?.click()
          break
        // フォーカスを一覧へ移動
        case 'left':
          setListFocus(focusedMemo, true)
          break
      }
    },
    {
      enableOnFormTags: true, // テキストエリアにフォーカスがあってもフォーカス移動できるようにする
    },
  )

  const isPrevew = !!memoSettings.listDisplay.content

  return (
    <div className="space-y-4 px-1 lg:py-4">
      <div className="flex items-center space-x-2 px-3">
        <Form action={MEMO_URL} method="post">
          <Button
            type="submit"
            variant="secondary"
            className="h-8 px-3"
            ref={useAddButtonRef}
          >
            <RiAddLine className="mr-2" />
            {t('common.message.add')}
            <p className="ml-2 text-xs text-muted-foreground">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5">
                <span>{modifierKeyIcon}</span>n
              </kbd>
            </p>
          </Button>
        </Form>
        <Input
          type="search"
          placeholder={t('memo.message.title_search')}
          onChange={(event) => searchMemosDebounce(event.target.value)}
          className="h-8"
          id="memos-title-search"
        />
        <MemoSettingsForm />
      </div>
      <ScrollArea className="h-[calc(100dvh_-_121px)] lg:h-[calc(100dvh_-_155px)] xl:h-[calc(100dvh_-_115px)]">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id="dnd-context-for-memos"
        >
          <div className="space-y-3 px-3" id="memos" ref={useMemosRef}>
            <SortableContext
              items={dispMemos}
              strategy={verticalListSortingStrategy}
            >
              {dispMemos.length ? (
                dispMemos.map((item: Memo) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    onFocus={() => setFocusedMemo(item)}
                    isSelected={item.id === selectedMemo?.id}
                    isPreview={isPrevew}
                  >
                    <MemoActionMenu
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
      <MemoDeleteConfirmDialog
        memo={actionMemo}
        isOpen={isOpenDeleteDialog}
        setIsOpen={setIsOpenDeleteDialog}
      />
    </div>
  )
}
