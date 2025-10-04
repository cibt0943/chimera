import * as React from 'react'
import { LuCalendar, LuX } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Matcher } from 'react-day-picker'
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
  triggerId?: string
  selectedDate: Date | undefined
  defaultMonth: Date | undefined
  onChangeDate: (date: Date | undefined) => void
  placeholder?: string
  disabled?: Matcher
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
}

export function DatePicker({
  triggerId,
  selectedDate,
  defaultMonth,
  onChangeDate,
  placeholder,
  disabled,
  captionLayout,
  ...divProps
}: DatePickerProps) {
  return (
    <DateTimePicker
      selectedDate={selectedDate}
      defaultMonth={defaultMonth}
      allDay={true}
      defaultAllDay={true}
      includeAllDayComponent={false}
      onChangeDate={onChangeDate}
      triggerId={triggerId}
      placeholder={placeholder}
      disabled={disabled}
      captionLayout={captionLayout}
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
  triggerId,
  selectedDate,
  defaultMonth,
  allDay,
  defaultAllDay,
  includeAllDayComponent,
  onChangeDate,
  onChangeAllDay = () => {},
  placeholder,
  disabled,
  captionLayout,
  ...divProps
}: DateTimePickerProps) {
  const { i18n } = useTranslation()
  const locale = getLocale(i18n.language)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const { className, ...otherDivProps } = divProps || {}

  const handleChangeDate = React.useCallback(
    (newDate: Date | undefined) => {
      if (selectedDate !== newDate) onChangeDate(newDate)
    },
    [selectedDate, onChangeDate],
  )

  const handleChangeAllDay = React.useCallback(
    (newAllDay: boolean) => {
      if (allDay !== newAllDay) onChangeAllDay(newAllDay)

      if (newAllDay && selectedDate) {
        const updatedDate = new Date(selectedDate)
        updatedDate.setHours(9, 0)
        onChangeDate(updatedDate)
      }
    },
    [allDay, selectedDate, onChangeAllDay, onChangeDate],
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
            <LuCalendar className="text-muted-foreground" />
            <DispValue
              date={selectedDate}
              allDay={allDay}
              placeholder={placeholder}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            defaultMonth={defaultMonth}
            captionLayout={captionLayout}
            locale={locale}
            selected={selectedDate}
            onSelect={(selectedDay: Date | undefined) => {
              if (selectedDay) {
                // 日付が変更されても時分は維持（デフォルトは9:00）
                selectedDay.setHours(
                  selectedDate?.getHours() || 9,
                  selectedDate?.getMinutes() || 0,
                )
              }
              handleChangeDate(selectedDay)
            }}
            disabled={disabled}
          />
          <TimeControl
            date={selectedDate}
            allDay={allDay}
            includeAllDayComponent={includeAllDayComponent}
            onChangeDate={handleChangeDate}
            onChangeAllDay={handleChangeAllDay}
          />
        </PopoverContent>
      </Popover>
      {selectedDate && (
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
          <LuX className="text-muted-foreground" />
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
    <div className={cn('flex items-center justify-between p-3', className)}>
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
        <LuCalendar className="text-muted-foreground" />
        <DispValue placeholder={placeholder} />
      </Button>
    </div>
  )
}
