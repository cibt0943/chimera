import { RxCross2 } from 'react-icons/rx'
import { Table } from '@tanstack/react-table'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { TaskStatusList } from '~/types/tasks'
import { TodoTableViewOptions } from './todo-table-view-options'
import { TodoTableFacetedFilter } from './todo-table-faceted-filter'

interface TodoTableToolbarProps<TData> {
  table: Table<TData>
}

export function TodoTableToolbar<TData>({
  table,
}: TodoTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-1 items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
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
            title="Status"
            options={TaskStatusList}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <RxCross2 className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <TodoTableViewOptions table={table} />
    </div>
  )
}
