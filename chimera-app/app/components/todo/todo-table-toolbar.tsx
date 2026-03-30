import { useTranslation } from 'react-i18next'
import { LuCircleX } from 'react-icons/lu'
import { Table } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { TaskStatusListByDispOrder } from '~/types/tasks'
import { TodoTableViewOptions } from './todo-table-view-options'
import { TodoTableFacetedFilter } from './todo-table-faceted-filter'

interface TodoTableToolbarProps<TData> {
  table: Table<TData>
}

export function TodoTableToolbar<TData>({
  table,
}: TodoTableToolbarProps<TData>) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 items-center justify-between gap-2">
      <Input
        type="search"
        placeholder={t('task.message.title_search')}
        value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn('title')?.setFilterValue(event.target.value)
        }
        className="h-8 w-64"
        id="tasks-title-search"
      />
      {table.getColumn('status') && (
        <TodoTableFacetedFilter
          column={table.getColumn('status')}
          title={t('task.message.status_filter')}
          options={TaskStatusListByDispOrder}
        />
      )}
      <TodoTableViewOptions table={table} />
    </div>
  )
}
