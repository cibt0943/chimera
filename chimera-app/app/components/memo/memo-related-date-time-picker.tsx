import { useTranslation } from 'react-i18next'
import { toDate } from 'date-fns'
import { FieldMetadata, useInputControl } from '@conform-to/react'
import { DateTimePicker } from '~/components/lib/date-time-picker'

type DateTimePickerProps = {
  meta: FieldMetadata<Date | null>
  divProps?: React.ComponentProps<'div'>
}

export function MemoRelatedDateTimePicker({
  meta,
  divProps,
}: DateTimePickerProps) {
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
      divProps={divProps}
    />
  )
}
