import { useNavigate } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { LuArchive } from 'react-icons/lu'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { cn } from '~/lib/utils'
import { useAgoFormat } from '~/lib/hooks'
import { Memo, MemoStatus } from '~/types/memos'
import { MEMO_URL } from '~/constants'

function NavLinkClassName({
  item,
  isSelected,
  isFocused,
}: {
  item: Memo
  isSelected: boolean
  isFocused: boolean
}) {
  const selectedClassName = isSelected
    ? 'bg-muted'
    : 'bg-background hover:bg-muted'
  const focusedClassName = isFocused ? 'ring-1 ring-inset ring-ring' : ''

  const archiveClassName =
    item.status === MemoStatus.ARCHIVED ? 'text-muted-foreground' : ''

  return cn(
    'flex flex-col gap-2 rounded-md border p-3 text-sm group',
    'select-none outline-none',
    // 'outline-none focus:ring-1 focus:ring-inset focus:ring-ring',
    // 'select-none',
    selectedClassName,
    focusedClassName,
    archiveClassName,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  onFocus: () => void
  isSelected: boolean
  isFocused: boolean
  isPreview: boolean
  children: React.ReactNode
}

export function ListItem(props: ListItemProps) {
  const { item, onFocus, isSelected, isFocused, isPreview, children } = props

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
  const navigate = useNavigate()

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
    WebkitTouchCallout: 'none', // iOSの長押し時のコンテキストメニューの表示を防ぐ
    cursor: isDragging ? 'grabbing' : 'pointer',
  }

  // const updatedAtDiff = useDateDiffFormat(item.updatedAt)
  const updatedAtDiff = useAgoFormat(item.updatedAt)
  const updatedAt = format(item.updatedAt, t('common.format.date_time_format'))
  const to = [MEMO_URL, item.id].join('/')
  const title = item.title || t('memo.message.un_titled')
  const content = isPreview ? item.content.substring(0, 300) || '　' : ''

  return (
    <div
      {...attributes}
      {...listeners}
      id={`memo-${item.id}`}
      ref={setNodeRef}
      className={NavLinkClassName({ item, isSelected, isFocused })}
      style={style}
      onFocus={onFocus}
      role="button"
      data-role="listitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.altKey) {
          navigate(to, { replace: true })
        }
      }}
      onClick={(e) => {
        navigate(to, { replace: true })
      }}
    >
      <div className="flex items-center">
        <div className="line-clamp-1">{title}</div>
        <div className="ml-auto">{children}</div>
      </div>
      <div className="line-clamp-1 text-xs text-muted-foreground">
        {content}
      </div>
      <div className="flex items-center justify-between space-x-2">
        <div>{item.status === MemoStatus.ARCHIVED && <LuArchive />}</div>
        <div className="ml-auto text-xs text-muted-foreground">
          <ClientOnly fallback={<span>&nbsp;</span>}>
            {() => <span title={updatedAt}>{updatedAtDiff}</span>}
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}
