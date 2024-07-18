import * as React from 'react'
import { Form, useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RxPlus } from 'react-icons/rx'
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
import { Label } from '~/components/ui/label'
import { Switch } from '~/components/ui/switch'
import { useDebounce, useQueue } from '~/lib/utils'
import { Memos, Memo, MemoStatus } from '~/types/memos'
import { ListItem } from './memo-list-item'
import { MemoActions } from './memo-actions'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'
import { useAtomValue } from 'jotai'
import { memoSettingsAtom } from '~/lib/state'

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
  useHotkeys<HTMLDivElement>(
    [
      'up',
      'down',
      'mod+up',
      'alt+up',
      'mod+down',
      'alt+down',
      'mod+i',
      'alt+i',
      'mod+enter',
      'alt+enter',
      'mod+delete',
      'alt+delete',
      'mod+backspace',
      'alt+backspace',
    ],
    (_, handler) => {
      // ダイアログが開いている場合は何もしない
      if (isOpenDeleteDialog) return
      switch (handler.keys?.join('')) {
        // フォーカス移動
        case 'up':
        case 'down':
          handler.mod || handler.alt
            ? moveSelectedMemoOneStep(handler.keys.includes('up'))
            : changeFocusedMemoOneStep(handler.keys.includes('up'))
          break
        // メモ追加
        case 'i':
          addButtonRef.current?.click()
          break
        // メモのアーカイブ
        case 'enter':
          updateSeletedMemoStatus(MemoStatus.ARCHIVED)
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
    },
  )

  // メモ一覧をフィルタリング
  async function filterMemos(searchTerm: string) {
    setFilter(searchTerm.toLowerCase())
  }
  const filterMemosDebounce = useDebounce((searchTerm) => {
    filterEnqueue(() => filterMemos(searchTerm))
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
    if (!selectedMemo) return
    moveMemoOneStep(selectedMemo, isUp)
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
  function updateSeletedMemoStatus(status: MemoStatus) {
    if (!selectedMemo) return
    updateMemoStatus(selectedMemo, status)
  }

  // メモのステータスを変更
  function updateMemoStatus(memo: Memo, status: MemoStatus) {
    fetcher.submit(
      { status: status },
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
        navigate('.', { replace: true })
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
      <ScrollArea className="h-[calc(100vh_-_145px)]">
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
                    actionComponent={
                      <MemoActions
                        memo={item}
                        handleMoveMemo={moveMemoOneStep}
                        handleUpdateMemoStatus={updateMemoStatus}
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
      <div className="flex items-center space-x-2 px-3">
        <StatusFilter />
      </div>
      {actionMemo ? (
        <MemoDeleteConfirmDialog
          memo={actionMemo}
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
        />
      ) : null}
    </div>
  )
}

function StatusFilter() {
  const { t } = useTranslation()
  const fetcher = useFetcher()
  const memoSettings = useAtomValue(memoSettingsAtom)

  // 表示するメモのフィルタ
  function updateMemoSettingStatusFilter(statuses: MemoStatus[]) {
    fetcher.submit(
      {
        list_filter: {
          statuses: statuses,
        },
      },
      {
        action: `/account/memo/settings`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  if (!memoSettings) return null

  return (
    <>
      <Switch
        id="show-all-memo"
        name="show-all-memo"
        defaultChecked={memoSettings?.list_filter.statuses.includes(1)}
        // checked={memoSettings?.list_filter.statuses.includes(1)}
        onCheckedChange={(isChecked) => {
          const statuses = isChecked
            ? [MemoStatus.NOMAL, MemoStatus.ARCHIVED]
            : [MemoStatus.NOMAL]
          console.log(statuses)
          updateMemoSettingStatusFilter(statuses)
        }}
      />
      <Label htmlFor="show-all-memo" className="text-sm">
        {t('memo.message.show_archived')}
      </Label>
    </>
  )
}
