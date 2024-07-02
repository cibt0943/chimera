import { RxPlus } from 'react-icons/rx'
import { NavLink, useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Memos, Memo } from '~/types/memos'

interface MemoListProps {
  items: Memos
}

type NavLinkClassNameProps = {
  isActive: boolean
  isPending: boolean
}

function NavLinkClassName({ isActive }: NavLinkClassNameProps) {
  const className = isActive ? 'bg-blue-100' : 'hover:bg-accent'
  return cn('flex flex-col gap-2 rounded-lg border p-3 text-sm', className)
}

// Item Component
function ListIterm({ item }: { item: Memo }) {
  return (
    <NavLink
      className={NavLinkClassName}
      to={`${item.id}`}
      key={item.id}
      id={`row-${item.id}`}
    >
      <div>{item.title}</div>
      <div className="line-clamp-2 text-xs text-muted-foreground">
        {item.content.substring(0, 300)}
      </div>
    </NavLink>
  )
}

export function MemoList({ items }: MemoListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="mr-6 space-y-4">
      <div className="flex items-center space-x-2">
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
      <ScrollArea className="h-screen">
        <div className="flex flex-col space-y-3">
          {items.map((item) => (
            <ListIterm key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
