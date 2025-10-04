import * as React from 'react'
import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DateTimePicker } from '~/components/lib/date-time-picker'
import { Matcher } from 'react-day-picker'

export interface DateTimePickerConformProps
  extends React.ComponentProps<'div'> {
  dateMeta: FieldMetadata<Date | undefined>
  allDayMeta: FieldMetadata<boolean | undefined>
  defaultAllDay: boolean
  includeAllDayComponent: boolean
  onChangeData?: (date: Date | undefined) => void
  onChangeAllDay?: (isAllDay: boolean) => void
  placeholder?: string
  disabled?: Matcher
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
}

export function DateTimePickerConform(props: DateTimePickerConformProps) {
  const {
    dateMeta,
    allDayMeta,
    defaultAllDay,
    includeAllDayComponent,
    onChangeData,
    onChangeAllDay,
    placeholder,
    disabled,
    captionLayout,
    ...divProps
  } = props

  const dateValue = React.useMemo(
    () => (dateMeta.value ? toDate(dateMeta.value) : undefined),
    [dateMeta.value],
  )
  const allDayValue = allDayMeta.value === 'on'

  const dateControl = useInputControl(dateMeta)
  const allDayControl = useInputControl(allDayMeta)

  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    dateValue,
  )

  React.useEffect(() => {
    setInternalDate(dateValue)
  }, [dateValue])

  const handleChangeDate = React.useCallback(
    (date: Date | undefined) => {
      setInternalDate(date)
      dateControl.change(date?.toISOString() || '')
      onChangeData && onChangeData(date)
    },
    [dateControl, onChangeData],
  )

  const handleChangeAllDay = React.useCallback(
    (isAllDay: boolean) => {
      allDayControl.change(isAllDay ? 'on' : '')
      onChangeAllDay && onChangeAllDay(isAllDay)
    },
    [allDayControl, onChangeAllDay],
  )

  return (
    <DateTimePicker
      selectedDate={internalDate}
      defaultMonth={internalDate}
      allDay={allDayValue}
      defaultAllDay={defaultAllDay}
      includeAllDayComponent={includeAllDayComponent}
      onChangeDate={handleChangeDate}
      onChangeAllDay={handleChangeAllDay}
      triggerId={dateMeta.id}
      placeholder={placeholder}
      disabled={disabled}
      captionLayout={captionLayout}
      {...divProps}
    />
  )
}
