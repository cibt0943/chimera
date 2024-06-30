import { RxCross2 } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'
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
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          type="search"
          placeholder={t('task.message.title_filter')}
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
          id="tasks-title-filter"
        />
        {table.getColumn('status') && (
          <TodoTableFacetedFilter
            column={table.getColumn('status')}
            title={t('task.message.status_filter')}
            options={TaskStatusListByDispOrder}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t('common.message.reset')}
            <RxCross2 className="ml-2 h-3 w-3" />
          </Button>
        )}
      </div>
      <TodoTableViewOptions table={table} />
    </div>
  )
}
