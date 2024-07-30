import * as React from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { RxCalendar } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { cn, getLocale } from '~/lib/utils'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { TimePicker } from './time-picker'

type DateTimePickerProps = {
  value: Date | undefined
  handleChange: (date: Date | undefined) => void
  triggerId?: string
  placeholder?: string
  divProps?: React.ComponentProps<'div'>
}

export function DateTimePicker({
  value,
  handleChange,
  triggerId,
  placeholder,
  divProps,
}: DateTimePickerProps) {
  const { t, i18n } = useTranslation()
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)
  const locale = getLocale(i18n.language)
  const setDate = (date: Date | undefined) => {
    handleChange(date)
  }

  const { className, ...props } = divProps || {}

  return (
    <div
      className={cn('flex items-center rounded-md border', className)}
      {...props}
    >
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" id={triggerId}>
            <RxCalendar className="h-5 w-5 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverTrigger asChild>
          <div className="grow cursor-pointer pl-2 text-sm">
            {value ? (
              format(value, t('common.format.date_time_short_format'))
            ) : (
              // format(value, t('common.format.date_time_format'))
              <span className="opacity-50">{placeholder || 'Pick a date'}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(selectedDay) => {
              if (selectedDay) {
                // const [hours, minutes, seconds] = value
                //   ? [value.getHours(), value.getMinutes(), value.getSeconds()]
                //   : [9, 0, 0]
                // selectedDay.setHours(hours, minutes, seconds, 0)
                const [hours, minutes] = value
                  ? [value.getHours(), value.getMinutes()]
                  : [9, 0]
                selectedDay.setHours(hours, minutes, 0, 0)
              }
              handleChange(selectedDay)
              // setIsCalendarOpen(false)
            }}
            defaultMonth={value}
            initialFocus
            locale={locale} // ここでlocaleを渡す
          />
          <div className="border-t border-border p-3">
            <TimePicker date={value} setDate={setDate} />
          </div>
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleChange(undefined)}
        >
          <RiCloseLine className="h-4 w-4 text-primary/30" />
        </Button>
      )}
    </div>
  )
}
