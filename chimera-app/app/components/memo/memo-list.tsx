import * as React from 'react'
import { RxPlus } from 'react-icons/rx'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { useHotkeys } from 'react-hotkeys-hook'
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
  const [memos, setMemos] = React.useState(defaultMemos)
  const showMemo = defaultMemos.find((memo) => memo.id === showId)
  const [actionMemo, setActionMemo] = React.useState<Memo | undefined>(showMemo) // 編集・削除するメモ
  const [focusedMemo, setFocusedMemo] = React.useState<Memo | undefined>(
    showMemo,
  ) // 一覧でフォーカスしているメモ
  const [selectedMemo, setSelectedMemo] = React.useState<Memo | undefined>(
    showMemo,
  ) // 一覧で選択しているメモ
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  const memosRefs = React.useRef<HTMLDivElement>(null)
  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  // メモデータが変更されたら一覧を更新
  React.useEffect(() => {
    setMemos(defaultMemos)
  }, [defaultMemos])

  // focusedMemoに合わせてフォーカスを設定
  React.useEffect(() => {
    if (!focusedMemo) return
    memosRefs.current
      ?.querySelector<HTMLElement>(`#memo-${focusedMemo.id}`)
      ?.focus()
  }, [focusedMemo])

  // フォーカス移動
  useHotkeys(['up', 'down'], (_, handler) => {
    if (!memos.length || !focusedMemo) return
    const isUp = handler.keys?.includes('up')

    const nowIndex = memos.findIndex((memo) => memo.id === focusedMemo.id)
    const toIndex = isUp ? nowIndex - 1 : nowIndex + 1
    if (toIndex < 0 || toIndex >= memos.length) return
    setFocusedMemo(memos[toIndex])
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
    if (!searchTerm) {
      setMemos(defaultMemos)
      return
    }

    const search = searchTerm.toLowerCase()
    const filteredMemos = defaultMemos.filter((memo) =>
      memo.title.toLowerCase().includes(search),
    )

    setMemos(filteredMemos)
  }
  const filterMemosDebounce = useDebounce((searchTerm) => {
    enqueue(() => filterMemos(searchTerm))
  }, 300)

  function handleDeleteMemo(memo: Memo) {
    setActionMemo(memo)
    setIsOpenDeleteDialog(true)
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
        <div className="space-y-3 px-3" id="memos" ref={memosRefs}>
          {memos.map((item: Memo) => (
            <ListIterm
              key={item.id}
              item={item}
              handleDeleteMemo={handleDeleteMemo}
              setFucusedMemo={setFocusedMemo}
              isSelected={item.id === selectedMemo?.id}
              setSelectedMemo={setSelectedMemo}
            />
          ))}
        </div>
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
