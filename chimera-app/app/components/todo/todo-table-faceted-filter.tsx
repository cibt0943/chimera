import { useTranslation } from 'react-i18next'
import { LuFilter, LuX } from 'react-icons/lu'
import { Column } from '@tanstack/react-table'
import { Checkbox } from '~/components/ui/checkbox'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Separator } from '~/components/ui/separator'
import { TaskStatus } from '~/types/tasks'

interface TodoTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: TaskStatus
    // icon?: React.ComponentType<{ className?: string }>
  }[]
}

export function TodoTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: TodoTableFacetedFilterProps<TData, TValue>) {
  const { t } = useTranslation()
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as TaskStatus[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <LuFilter />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {t(option.label)}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      {selectedValues.size > 0 && (
        <Button
          variant="ghost"
          onClick={() => column?.setFilterValue(undefined)}
        >
          <LuX />
          {t('common.message.clear')}
        </Button>
      )}
      <PopoverContent className="w-40 p-0" align="start">
        <div>
          <div>
            {options.length === 0 && <div>{t('common.message.no_result')}</div>}
            <FieldGroup className="gap-3 p-2">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <Field orientation="horizontal" key={option.value}>
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedValues.add(option.value)
                        } else {
                          selectedValues.delete(option.value)
                        }
                        const filterValues = Array.from(selectedValues)
                        column?.setFilterValue(
                          filterValues.length ? filterValues : undefined,
                        )
                      }}
                    />
                    <FieldLabel htmlFor={`status-${option.value}`}>
                      <span>{t(option.label)}</span>
                      {facets?.get(option.value) && (
                        <span className="text-muted-foreground ml-auto flex size-4 items-center justify-center font-mono text-xs">
                          {facets.get(option.value)}
                        </span>
                      )}
                    </FieldLabel>
                  </Field>
                )
              })}
            </FieldGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
