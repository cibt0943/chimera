// import { format } from 'date-fns'
import { NavLink } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { cn, useAgoFormat } from '~/lib/utils'
import { MemoActions } from './memo-actions'
import { Memo } from '~/types/memos'

function NavLinkClassName({ isSelected }: { isSelected: boolean }) {
  const className = isSelected ? 'bg-blue-100' : 'hover:bg-accent'
  return cn(
    'flex flex-col gap-2 rounded-lg border p-3 text-sm group',
    'focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400',
    className,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  handleDeleteMemo: (memo: Memo) => void
  setFucusedMemo: (memo: Memo) => void
  isSelected: boolean
  setSelectedMemo: (memo: Memo) => void
}

export function ListIterm({
  item,
  handleDeleteMemo,
  setFucusedMemo,
  isSelected,
  setSelectedMemo,
}: ListItemProps) {
  const { t } = useTranslation()

  return (
    <NavLink
      className={NavLinkClassName({ isSelected })}
      to={`/memos/${item.id}`}
      id={`memo-${item.id}`}
      onClick={() => {
        setFucusedMemo(item)
        setSelectedMemo(item)
      }}
    >
      <div className="flex items-center">
        <div className="line-clamp-1">{item.title || t('memo.un_titled')}</div>
        <div className="ml-auto">
          <MemoActions memo={item} handleDeleteMemo={handleDeleteMemo} />
        </div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {item.content.substring(0, 300)}
      </div>
      <div
        className="ml-auto text-xs text-muted-foreground"
        // 下記を表示するとエラーが発生する。サーバーサイドとクライアントで時間側が異なるためと思われる。
        // title={format(item.updated_at, t('common.format.datetime_format'))}
      >
        {useAgoFormat(item.updated_at)}
      </div>
    </NavLink>
  )
}
