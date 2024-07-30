import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DateTimePicker } from '~/components/lib/date-time-picker'

type DateTimePickerProps = {
  meta: FieldMetadata<Date | null>
}

export function EventDateTimePicker({ meta }: DateTimePickerProps) {
  const control = useInputControl(meta)

  const handleChange = (date: Date | undefined) => {
    control.change(date?.toISOString() || '')
  }

  const value = control.value ? toDate(control.value) : undefined

  return (
    <DateTimePicker
      value={value}
      handleChange={handleChange}
      triggerId={meta.id}
    />
  )
}
