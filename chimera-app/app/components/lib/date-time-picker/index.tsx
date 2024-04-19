import * as React from 'react'
import { RxCalendar, RxCross2 } from 'react-icons/rx'
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
import { TimePicker } from './time-picker'

type DateTimePickerProps = {
  meta: FieldMetadata<Date | null>
}

export function DateTimePicker({ meta }: DateTimePickerProps) {
  const control = useInputControl(meta)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const setDate = (date: Date | undefined) => {
    control.change(date?.toISOString() || '')
  }

  return (
    <div
      className={cn(
        // 'flex items-center rounded-md border ring-offset-background focus-within:ring-1 focus-within:ring-ring',
        'flex items-center rounded-md border',
      )}
    >
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant={'ghost'} className="border-r" id={meta.id}>
            <RxCalendar className="h-5 w-5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverTrigger asChild>
          <div className="grow pl-3 cursor-pointer">
            {control.value ? (
              format(control.value, 'yyyy/MM/dd HH:mm:ss')
            ) : (
              <span className="opacity-50">Pick a date</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={control.value ? toDate(control.value) : undefined}
            onSelect={(value) => {
              if (value) {
                value.setHours(9, 0, 0, 0)
              }
              control.change(value?.toISOString() || '')
              // setIsCalendarOpen(false)
            }}
            defaultMonth={control.value ? toDate(control.value) : undefined}
            initialFocus
            locale={ja} // ここでlocaleを渡す
          />
          <div className="p-3 border-t border-border">
            <TimePicker
              setDate={setDate}
              date={control.value ? toDate(control.value) : undefined}
            />
          </div>
        </PopoverContent>
      </Popover>
      {control.value && (
        <Button variant="ghost" size="icon" onClick={() => control.change('')}>
          <RxCross2 className={cn('h-4 w-4 text-primary/30')} />
        </Button>
      )}
    </div>
  )
}
