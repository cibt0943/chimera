import * as React from 'react'
import { RxPlus } from 'react-icons/rx'
import { NavLink, useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Memos, Memo } from '~/types/memos'
import { MemoActions } from './memo-actions'
import { MemoDeleteConfirmDialog } from './memo-delete-confirm-dialog'

interface MemoListProps {
  items: Memos
}

type NavLinkClassNameProps = {
  isActive: boolean
  isPending: boolean
}

function NavLinkClassName({ isActive }: NavLinkClassNameProps) {
  const className = isActive ? 'bg-blue-100' : 'hover:bg-accent'
  return cn(
    'flex flex-col gap-2 rounded-lg border outline-offset-0 p-3 text-sm group',
    className,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  handleDeleteMemo: (memo: Memo) => void
}

function ListIterm({ item, handleDeleteMemo }: ListItemProps) {
  return (
    <NavLink
      className={NavLinkClassName}
      to={`/memos/${item.id}`}
      key={item.id}
      id={`row-${item.id}`}
    >
      <div className="flex items-center">
        <div className="line-clamp-1">{item.title}</div>
        <div className="ml-auto">
          <MemoActions memo={item} handleDeleteMemo={handleDeleteMemo} />
        </div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {item.content.substring(0, 300)}
      </div>
    </NavLink>
  )
}

export function MemoList({ items }: MemoListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)
  const [selectedMemo, setSelectedMemo] = React.useState<Memo>() // 編集・削除するメモ

  function handleDeleteMemo(memo: Memo) {
    setSelectedMemo(memo)
    setIsOpenDeleteDialog(true)
  }

  function DeleteConfirmMemoDialog() {
    if (!selectedMemo) return null

    return (
      <MemoDeleteConfirmDialog
        memo={selectedMemo}
        isOpenDialog={isOpenDeleteDialog}
        setIsOpenDialog={setIsOpenDeleteDialog}
      />
    )
  }

  return (
    <div className="space-y-4 px-1 py-4">
      <div className="flex items-center space-x-2 px-3">
        <Input
          type="search"
          placeholder={t('memo.message.title_filter')}
          value={''}
          onChange={(event) => console.log(event.target.value)}
          className="h-8"
          id="memos-title-filter"
        />
        <Button
          variant="secondary"
          className="h-8 px-2 lg:px-3"
          onClick={() => navigate('/memos')}
        >
          <RxPlus className="mr-2" />
          {t('common.message.add')}
          <p className="text-[10px] text-muted-foreground ml-2">
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 text-muted-foreground">
              <span className="text-xs">⌘</span>i
            </kbd>
          </p>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh_-_110px)]">
        <div className="space-y-3 px-3">
          {items.map((item) => (
            <ListIterm
              key={item.id}
              item={item}
              handleDeleteMemo={handleDeleteMemo}
            />
          ))}
        </div>
      </ScrollArea>
      <DeleteConfirmMemoDialog />
    </div>
  )
}
