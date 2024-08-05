import * as React from 'react'
import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DateTimePicker } from '~/components/lib/date-time-picker'

export interface DateTimePickerConformProps
  extends React.ComponentProps<'div'> {
  dateMeta: FieldMetadata<Date | undefined>
  allDayMeta: FieldMetadata<boolean | undefined>
  defaultAllDay: boolean
  includeAllDayComponent: boolean
  onChangeData?: (date: Date | undefined) => void
  onChangeAllDay?: (isAllDay: boolean) => void
  placeholder?: string
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
    ...divProps
  } = props

  const dateValue = dateMeta.value ? toDate(dateMeta.value) : undefined
  const allDayValue = allDayMeta.value === 'on'

  const dateControl = useInputControl(dateMeta)
  const allDayControl = useInputControl(allDayMeta)

  // 選択された日時が変更されたときに呼ばれるコールバック
  const handleChangeDate = React.useCallback(
    (date: Date | undefined) => {
      dateControl.change(date?.toISOString() || '')
      onChangeData && onChangeData(date)
    },
    [dateControl, onChangeData],
  )

  // 終日か否かが変更されたときに呼ばれるコールバック
  const handleChangeAllDay = React.useCallback(
    (isAllDay: boolean) => {
      allDayControl.change(isAllDay ? 'on' : '')
      onChangeAllDay && onChangeAllDay(isAllDay)
    },
    [allDayControl, onChangeAllDay],
  )

  return (
    <DateTimePicker
      date={dateValue}
      allDay={allDayValue}
      defaultAllDay={defaultAllDay}
      includeAllDayComponent={includeAllDayComponent}
      onChangeDate={handleChangeDate}
      onChangeAllDay={handleChangeAllDay}
      triggerId={dateMeta.id}
      placeholder={placeholder}
      {...divProps}
    />
  )
}
