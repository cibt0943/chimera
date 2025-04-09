import { useTranslation } from 'react-i18next'
import {
  LuChevronsUpDown,
  LuArrowUpNarrowWide,
  LuArrowDownWideNarrow,
} from 'react-icons/lu'
import { Column } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { cn } from '~/lib/utils'
interface TodoTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function TodoTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: TodoTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation()

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <LuArrowDownWideNarrow />
            ) : column.getIsSorted() === 'asc' ? (
              <LuArrowUpNarrowWide />
            ) : (
              <LuChevronsUpDown className="h-3.5! w-3.5!" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(column.getIsSorted() === 'desc' || !column.getIsSorted()) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <LuArrowUpNarrowWide className="text-muted-foreground/70" />
              {t('common.message.sort_asc')}
            </DropdownMenuItem>
          )}
          {(column.getIsSorted() === 'asc' || !column.getIsSorted()) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <LuArrowDownWideNarrow className="text-muted-foreground/70" />
              {t('common.message.sort_desc')}
            </DropdownMenuItem>
          )}
          {column.getIsSorted() && (
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
