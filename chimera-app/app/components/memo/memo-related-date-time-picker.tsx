import { toDate } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DateTimePicker } from '~/components/lib/date-time-picker'

type DateTimePickerProps = {
  meta: FieldMetadata<Date | null>
}

export function MemoRelatedDateTimePicker({ meta }: DateTimePickerProps) {
  const { t } = useTranslation()
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
      placeholder={t('memo.model.related_date')}
    />
  )
}
