import * as React from 'react'
import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DatePicker } from '~/components/lib/date-time-picker'

export interface DatePickerConformProps extends React.ComponentProps<'div'> {
  dateMeta: FieldMetadata<Date | undefined>
  onChangeData?: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePickerConform(props: DatePickerConformProps) {
  const { dateMeta, onChangeData, placeholder, ...divProps } = props

  const dateValue = dateMeta.value ? toDate(dateMeta.value) : undefined
  const dateControl = useInputControl(dateMeta)

  // 選択された日時が変更されたときに呼ばれるコールバック
  const handleChangeDate = React.useCallback(
    (date: Date | undefined) => {
      dateControl.change(date?.toISOString() || '')
      onChangeData && onChangeData(date)
    },
    [dateControl, onChangeData],
  )

  return (
    <DatePicker
      date={dateValue}
      onChangeDate={handleChangeDate}
      triggerId={dateMeta.id}
      placeholder={placeholder}
      {...divProps}
    />
  )
}
