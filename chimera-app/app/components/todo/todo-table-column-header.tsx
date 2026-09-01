import { useTranslation } from 'react-i18next'
import {
  LuChevronsUpDown,
  LuArrowUpNarrowWide,
  LuArrowDownWideNarrow,
} from 'react-icons/lu'
import { Column } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'

interface TodoTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function TodoTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: TodoTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation()
  const sortDirection = column.getIsSorted()

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<div className="flex cursor-pointer items-center gap-1" />}
        >
          <span>{title}</span>
          {sortDirection === 'desc' ? (
            <LuArrowDownWideNarrow />
          ) : sortDirection === 'asc' ? (
            <LuArrowUpNarrowWide />
          ) : (
            <LuChevronsUpDown />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(sortDirection === 'desc' || !sortDirection) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <LuArrowUpNarrowWide className="text-muted-foreground/70" />
              {t('common.message.sort_asc')}
            </DropdownMenuItem>
          )}
          {(sortDirection === 'asc' || !sortDirection) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <LuArrowDownWideNarrow className="text-muted-foreground/70" />
              {t('common.message.sort_desc')}
            </DropdownMenuItem>
          )}
          {sortDirection && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <LuChevronsUpDown className="text-muted-foreground/70" />
                {t('common.message.clear')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
