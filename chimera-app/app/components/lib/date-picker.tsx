import * as React from 'react'
import { RxCalendar } from 'react-icons/rx'
import { format, toDate } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { cn } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

type DatePickerProps = {
  meta: FieldMetadata<Date | null>
}

export function DatePicker({ meta }: DatePickerProps) {
  const control = useInputControl(meta)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'pl-3 text-left font-normal',
            !control.value && 'text-muted-foreground',
          )}
        >
          {control.value ? (
            format(control.value, 'yyyy/MM/dd HH:mm')
          ) : (
            <span>Pick a date</span>
          )}
          <RxCalendar className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={control.value ? toDate(control.value) : undefined}
          onSelect={(value) => {
            control.change(value?.toISOString() ?? '')
            setIsCalendarOpen(false)
          }}
          defaultMonth={control.value ? toDate(control.value) : undefined}
          initialFocus
          locale={ja} // ここでlocaleを渡す
        />
      </PopoverContent>
    </Popover>
  )
}
