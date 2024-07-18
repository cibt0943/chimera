import { NavLink } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { RiArchiveLine } from 'react-icons/ri'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { cn, useDateDiffFormat } from '~/lib/utils'
import { Memo, MemoStatus } from '~/types/memos'

function NavLinkClassName({
  item,
  isSelected,
}: {
  item: Memo
  isSelected: boolean
}) {
  const selectedClassName = isSelected
    ? 'bg-blue-100 dark:bg-slate-700'
    : 'hover:bg-accent'

  const archiveClassName =
    item.status === MemoStatus.ARCHIVED ? 'text-muted-foreground' : ''

  return cn(
    'flex flex-col gap-2 rounded-lg border p-3 text-sm group',
    'focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400',
    selectedClassName,
    archiveClassName,
  )
}

// Item Component
interface ListItemProps {
  item: Memo
  setFocusedMemo: React.Dispatch<React.SetStateAction<Memo | undefined>>
  isSelected: boolean
  actionComponent: React.ReactNode
}

export function ListItem(props: ListItemProps) {
  const { item, setFocusedMemo, isSelected, actionComponent } = props

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
    <NavLink
      className={NavLinkClassName({ item, isSelected })}
      to={`/memos/${item.id}`}
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
        <div className="line-clamp-1">{item.title || t('memo.un_titled')}</div>
        <div className="ml-auto">{actionComponent}</div>
      </div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {item.content.substring(0, 300)}
      </div>
      <div className="flex justify-between items-center space-x-2">
        <div>
          {item.status === MemoStatus.ARCHIVED ? (
            <RiArchiveLine className="mr-2 h-4 w-4" />
          ) : null}
        </div>
        <ClientOnly fallback={<div className="text-xs">&nbsp;</div>}>
          {() => (
            <div
              className="ml-auto text-xs text-muted-foreground"
              // 下記を表示するとエラーが発生する。サーバーサイドとクライアントで時間側が異なるためと思われる。
              title={format(
                item.updated_at,
                t('common.format.date_time_format'),
              )}
            >
              {updatedAtDiff}
            </div>
          )}
        </ClientOnly>
      </div>
    </NavLink>
  )
}
