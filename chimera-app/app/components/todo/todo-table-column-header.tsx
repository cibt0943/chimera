import { useTranslation } from 'react-i18next'
import { RiExpandUpDownLine, RiSortAsc, RiSortDesc } from 'react-icons/ri'
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
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === 'desc' ? (
              <RiSortDesc className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'asc' ? (
              <RiSortAsc className="ml-2 h-4 w-4" />
            ) : (
              <RiExpandUpDownLine className="ml-2 h-3 w-3" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(column.getIsSorted() === 'desc' || !column.getIsSorted()) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <RiSortAsc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              {t('common.message.sort_asc')}
            </DropdownMenuItem>
          )}
          {(column.getIsSorted() === 'asc' || !column.getIsSorted()) && (
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <RiSortDesc className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              {t('common.message.sort_desc')}
            </DropdownMenuItem>
          )}
          {column.getIsSorted() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <RiExpandUpDownLine className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                {t('common.message.clear')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
