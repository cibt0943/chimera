import * as React from 'react'
import { RiCloseLine } from 'react-icons/ri'
import { RxCalendar } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Toggle } from '~/components/ui/toggle'
import { cn, getLocale } from '~/lib/utils'
import { TimePicker } from './time-picker'

export interface DatePickerProps extends React.ComponentProps<'div'> {
  date: Date | undefined
  onChangeDate: (date: Date | undefined) => void
  triggerId?: string
  placeholder?: string
}

export function DatePicker({
  date,
  onChangeDate,
  triggerId,
  placeholder = '',
  ...divProps
}: DatePickerProps) {
  return (
    <DateTimePicker
      date={date}
      allDay={true}
      defaultAllDay={true}
      includeAllDayComponent={false}
      onChangeDate={onChangeDate}
      triggerId={triggerId}
      placeholder={placeholder}
      {...divProps}
    />
  )
}

export interface DateTimePickerProps extends DatePickerProps {
  allDay: boolean
  defaultAllDay: boolean
  includeAllDayComponent: boolean
  onChangeAllDay?: (allDay: boolean) => void
}

export function DateTimePicker({
  date,
  allDay,
  defaultAllDay,
  includeAllDayComponent,
  onChangeDate,
  onChangeAllDay = () => {},
  triggerId,
  placeholder = '',
  ...divProps
}: DateTimePickerProps) {
  const { i18n } = useTranslation()
  const locale = getLocale(i18n.language)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const { className, ...otherDivProps } = divProps || {}

  const handleChangeDate = React.useCallback(
    (newDate: Date | undefined) => {
      if (date !== newDate) onChangeDate(newDate)
    },
    [date, onChangeDate],
  )

  const handleChangeAllDay = React.useCallback(
    (newAllDay: boolean) => {
      if (allDay !== newAllDay) onChangeAllDay(newAllDay)

      if (newAllDay && date) {
        const updatedDate = new Date(date)
        updatedDate.setHours(9, 0)
        onChangeDate(updatedDate)
      }
    },
    [allDay, date, onChangeAllDay, onChangeDate],
  )

  return (
    <div
      className={cn('flex items-center rounded-md border', className)}
      {...otherDivProps}
    >
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            id={triggerId}
            className="grow justify-start px-2"
          >
            <RxCalendar className="mr-2 h-5 w-5 text-muted-foreground" />
            <DispValue date={date} allDay={allDay} placeholder={placeholder} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={date}
            initialFocus={true}
            locale={locale}
            selected={date}
            onSelect={(selectedDay: Date | undefined) => {
              if (selectedDay) {
                // 日付が変更されても時分は維持（デフォルトは9:00）
                selectedDay.setHours(
                  date?.getHours() || 9,
                  date?.getMinutes() || 0,
                )
              }
              handleChangeDate(selectedDay)
            }}
          />
          <TimeControl
            date={date}
            allDay={allDay}
            includeAllDayComponent={includeAllDayComponent}
            onChangeDate={handleChangeDate}
            onChangeAllDay={handleChangeAllDay}
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            // 先にhandleChangeAllDayを呼び出してから、
            // 日付をリセットしないとhandleChangeAllDayの中で古い日付が使われてしまう
            includeAllDayComponent && handleChangeAllDay(defaultAllDay)
            handleChangeDate(undefined)
          }}
        >
          <RiCloseLine className="h-4 w-4 text-primary/30" />
        </Button>
      )}
    </div>
  )
}

interface TimeControlProps {
  date: Date | undefined
  allDay: boolean
  includeAllDayComponent: boolean
  onChangeDate: (date: Date | undefined) => void
  onChangeAllDay: (allDay: boolean) => void
}

function TimeControl({
  date,
  allDay,
  includeAllDayComponent,
  onChangeDate,
  onChangeAllDay,
}: TimeControlProps) {
  if (!includeAllDayComponent && allDay) return null

  const className = includeAllDayComponent ? 'justify-between' : 'justify-end'

  return (
    <div
      className={cn('flex items-center justify-between p-3 pt-0', className)}
    >
      {includeAllDayComponent && (
        <ToggleAllDay allDay={allDay} onChangeAllDay={onChangeAllDay} />
      )}
      {!allDay && <TimePicker date={date} setDate={onChangeDate} />}
    </div>
  )
}

interface DispValueProps {
  date?: Date
  allDay?: boolean
  placeholder?: string
}

function DispValue({ date, allDay = false, placeholder = '' }: DispValueProps) {
  const { t } = useTranslation()

  const [formattedDate, className] = date
    ? [
        format(
          date,
          allDay
            ? t('common.format.date_format')
            : t('common.format.date_time_short_format'),
        ),
        'font-normal',
      ]
    : [placeholder, 'font-normal text-muted-foreground']

  return <span className={className}>{formattedDate}</span>
}

interface ToggleAllDayProps {
  allDay: boolean
  onChangeAllDay: (allDay: boolean) => void
}

function ToggleAllDay({ allDay, onChangeAllDay }: ToggleAllDayProps) {
  const { t } = useTranslation()

  return (
    <Toggle
      defaultPressed={!allDay}
      onPressedChange={(pressed) => {
        onChangeAllDay(!pressed)
      }}
      className="w-22"
    >
      <span className="text-xs">{t('common.message.set_time')}</span>
    </Toggle>
  )
}

export interface DummyDateTimePickerProps {
  className?: string
  placeholder?: string
}

export function DummyDateTimePicker({
  className,
  placeholder,
}: DummyDateTimePickerProps) {
  return (
    <div className={cn('flex items-center rounded-md border', className)}>
      <Button variant="ghost" className="grow justify-start px-2">
        <RxCalendar className="mr-2 h-5 w-5 text-muted-foreground" />
        <DispValue placeholder={placeholder} />
      </Button>
    </div>
  )
}
