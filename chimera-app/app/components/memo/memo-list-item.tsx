import { useNavigate } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { LuArchive } from 'react-icons/lu'
import { useSortable } from '@dnd-kit/react/sortable'
import { cn } from '~/lib/utils'
import { useAgoFormat } from '~/lib/hooks'
import { Memo, MemoStatus } from '~/types/memos'
import { MEMO_URL } from '~/constants'

function getListItemClassName({
  item,
  isSelected,
}: {
  item: Memo
  isSelected: boolean
}) {
  const selectedClassName = isSelected
    ? 'bg-muted'
    : 'bg-background hover:bg-muted'

  const archiveClassName =
    item.status === MemoStatus.ARCHIVED ? 'text-muted-foreground' : ''

  return cn(
    'flex flex-col gap-2 rounded-md border p-3 text-sm group',
    'focus:inset-ring-ring outline-hidden focus:inset-ring',
    'select-none',
    selectedClassName,
    archiveClassName,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  index: number
  onFocus: () => void
  isSelected: boolean
  isPreview: boolean
  children: React.ReactNode
}

export function ListItem(props: ListItemProps) {
  const { item, index, onFocus, isSelected, isPreview, children } = props

  const { t } = useTranslation()
  const { ref, isDragging } = useSortable({
    id: item.id,
    index,
  })
  const navigate = useNavigate()

  const style: React.CSSProperties = isDragging
    ? {
        boxShadow:
          '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)',
      }
    : {}

  // const updatedAtDiff = useDateDiffFormat(item.updatedAt)
  const updatedAtDiff = useAgoFormat(item.updatedAt)
  const updatedAt = format(item.updatedAt, t('common.format.date_time_format'))
  const to = `${MEMO_URL}/${item.id}`
  const title = item.title || t('memo.message.un_titled')
  const content = isPreview ? item.content.substring(0, 300) || '　' : ''

  return (
    <div
      id={`memo-${item.id}`}
      ref={ref as React.Ref<HTMLDivElement>}
      className={getListItemClassName({ item, isSelected })}
      style={style}
      onFocus={onFocus}
      role="button"
      data-role="listitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.altKey) {
          navigate(to)
        }
      }}
      onClick={() => navigate(to)}
    >
      <div className="flex items-center">
        <div className="line-clamp-1">{title}</div>
        <div className="ml-auto">{children}</div>
      </div>
      <div className="text-muted-foreground line-clamp-1 text-xs">
        {content}
      </div>
      <div className="flex items-center justify-between space-x-2">
        <div>{item.status === MemoStatus.ARCHIVED && <LuArchive />}</div>
        <div className="text-muted-foreground ml-auto text-xs">
          <ClientOnly fallback={<span>&nbsp;</span>}>
            {() => <span title={updatedAt}>{updatedAtDiff}</span>}
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}
