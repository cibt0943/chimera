import { useTranslation } from 'react-i18next'
import { LuSettings2 } from 'react-icons/lu'
import { Table } from '@tanstack/react-table'
import { Button } from '~/components/ui/button-base'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

interface TodoTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function TodoTableViewOptions<TData>({
  table,
}: TodoTableViewOptionsProps<TData>) {
  const { t } = useTranslation()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <LuSettings2 /> {t('task.message.view_settings')}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t('task.message.select_columns')}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== 'undefined')
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                disabled={!column.getCanHide()}
              >
                {t(`task.model.${column.id}`)}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
