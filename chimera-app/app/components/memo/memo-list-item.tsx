import { NavLink } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { RiArchiveLine } from 'react-icons/ri'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { cn } from '~/lib/utils'
import { useAgoFormat } from '~/lib/hooks'
import { Memo, MemoStatus } from '~/types/memos'
import { MEMO_URL } from '~/constants'

function NavLinkClassName({
  item,
  isSelected,
}: {
  item: Memo
  isSelected: boolean
}) {
  const selectedClassName = isSelected ? 'bg-muted' : 'hover:bg-muted/50'
  // const selectedClassName = isSelected
  // ? 'bg-blue-100 dark:bg-muted'
  // : 'hover:bg-blue-100/50 dark:hover:bg-muted/50'

  const archiveClassName =
    item.status === MemoStatus.ARCHIVED ? 'text-muted-foreground' : ''

  return cn(
    'flex flex-col gap-2 rounded-lg border p-3 text-sm group',
    // 'focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400',
    'focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-ring',
    selectedClassName,
    archiveClassName,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  onFocus: () => void
  isSelected: boolean
  isPreview: boolean
  children: React.ReactNode
}

export function ListItem(props: ListItemProps) {
  const { item, onFocus, isSelected, isPreview, children } = props

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

  // const updatedAtDiff = useDateDiffFormat(item.updatedAt)
  const updatedAtDiff = useAgoFormat(item.updatedAt)
  const updatedAt = format(item.updatedAt, t('common.format.date_time_format'))
  const to = [MEMO_URL, item.id].join('/')
  const title = item.title || t('memo.message.un_titled')

  return (
    <NavLink
      className={NavLinkClassName({ item, isSelected })}
      to={to}
      id={`memo-${item.id}`}
      onFocus={onFocus}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="listitem"
    >
      <div className="flex items-center">
        <div className="line-clamp-1">{title}</div>
        <div className="ml-auto">{children}</div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {isPreview && item.content.substring(0, 300)}
      </div>
      <div className="flex items-center justify-between space-x-2">
        <div>
          {item.status === MemoStatus.ARCHIVED && (
            <RiArchiveLine className="mr-2 h-4 w-4" />
          )}
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          <ClientOnly fallback={<span>&nbsp;</span>}>
            {() => <span title={updatedAt}>{updatedAtDiff}</span>}
          </ClientOnly>
        </div>
      </div>
    </NavLink>
  )
}
