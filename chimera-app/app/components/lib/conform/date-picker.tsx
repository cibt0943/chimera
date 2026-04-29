import * as React from 'react'
import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DatePicker } from '~/components/lib/date-time-picker'
import { Matcher } from 'react-day-picker'

export interface DatePickerConformProps extends React.ComponentProps<'div'> {
  dateMeta: FieldMetadata<Date | undefined>
  onChangeData?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: Matcher
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
}

export function DatePickerConform(props: DatePickerConformProps) {
  const {
    dateMeta,
    onChangeData,
    placeholder,
    disabled,
    captionLayout,
    ...divProps
  } = props

  const dateValue = React.useMemo(
    () => (dateMeta.value ? toDate(dateMeta.value) : undefined),
    [dateMeta.value],
  )

  const dateControl = useInputControl(dateMeta)

  // 選択された日時が変更されたときに呼ばれるコールバック
  const handleChangeDate = React.useCallback(
    (date: Date | undefined) => {
      dateControl.change(date?.toISOString() || '')
      onChangeData?.(date)
    },
    [dateControl, onChangeData],
  )

  return (
    <DatePicker
      selectedDate={dateValue}
      defaultMonth={dateValue}
      onChangeDate={handleChangeDate}
      triggerId={dateMeta.id}
      placeholder={placeholder}
      disabled={disabled}
      captionLayout={captionLayout}
      {...divProps}
    />
  )
}
