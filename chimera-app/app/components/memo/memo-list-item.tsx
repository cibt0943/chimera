import { format } from 'date-fns'
import { NavLink, useSearchParams } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { cn, useDateDiffFormat } from '~/lib/utils'
import { Memo } from '~/types/memos'

function NavLinkClassName({ isSelected }: { isSelected: boolean }) {
  const className = isSelected
    ? 'bg-blue-100 dark:bg-slate-700'
    : 'hover:bg-accent'
  return cn(
    'flex flex-col gap-2 rounded-lg border p-3 text-sm group',
    'focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400',
    className,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  setFocusedMemo: (memo: Memo) => void
  isSelected: boolean
  actionComponent: React.ReactNode
}

export function ListIterm(props: ListItemProps) {
  const { item, setFocusedMemo, isSelected, actionComponent } = props
  const [searchParams] = useSearchParams()

  const { t } = useTranslation()
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: item.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
    // isDraggingの場合はpointerEventsをnoneにする(アンカーに対してドラッグ時のクリックを無効にする)
    // この処理をしないと、ドラッグ中にアンカーをクリックしてしまうため、リンク先に遷移してしまう
    // この方法のデメリットはドラッグ中のマウスポインターが標準のカーソルになること
    ...(isDragging && {
      pointerEvents: 'none',
    }),
  }

  const updatedAtDiff = useDateDiffFormat(item.updated_at)

  return (
    <ClientOnly>
      {() => (
        <NavLink
          className={NavLinkClassName({ isSelected })}
          to={`/memos/${item.id}?${searchParams.toString()}`}
          id={`memo-${item.id}`}
          onFocus={() => {
            setFocusedMemo(item)
          }}
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center">
            <div className="line-clamp-1">
              {item.title || t('memo.un_titled')}
            </div>
            <div className="ml-auto">{actionComponent}</div>
          </div>
          <div className="line-clamp-2 text-xs text-muted-foreground">
            {item.content.substring(0, 300)}
          </div>
          <div
            className="ml-auto text-xs text-muted-foreground"
            // 下記を表示するとエラーが発生する。サーバーサイドとクライアントで時間側が異なるためと思われる。
            title={format(item.updated_at, t('common.format.date_time_format'))}
          >
            {updatedAtDiff}
          </div>
        </NavLink>
      )}
    </ClientOnly>
  )
}
