import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { toDate } from 'date-fns'
import {
  useForm,
  getFormProps,
  FieldMetadata,
  useInputControl,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { EVENT_URL } from '~/constants'
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormFooter,
} from '~/components/lib/form'
import { Required } from '~/components/lib/required'
import { InputConform } from '~/components/lib/conform/input'
import { TextareaConform } from '~/components/lib/conform/textarea'
import { DateTimePicker } from '~/components/lib/date-time-picker'
import { Event, EventSchema, EventSchemaType } from '~/types/events'

type useInputControlType = ReturnType<typeof useInputControl<string>>

export interface EventFormProps {
  event: Event | undefined
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function EventForm({
  event,
  onSubmit,
  returnUrl = EVENT_URL,
  children,
}: EventFormProps) {
  const { t } = useTranslation()

  // 新規作成時であってもeventに初期値を埋めて送られてくるため、idがあるかどうかで判定
  function isNew(event: Event | undefined): event is undefined {
    return !event?.id
  }

  const action = isNew(event) ? EVENT_URL : [EVENT_URL, event.id].join('/')
  const formId = isNew(event) ? 'event-form-new' : `event-form-${event.id}`
  const defaultValue = event

  const [form, fields] = useForm<EventSchemaType>({
    id: formId,
    defaultValue: defaultValue,
    constraint: getZodConstraint(EventSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: EventSchema })
    },
    shouldRevalidate: 'onInput',
    onSubmit: onSubmit,
  })

  const startDateControl = useInputControl(fields.startDate)
  const endDateControl = useInputControl(fields.endDate)
  const allDayControl = useInputControl(fields.allDay)

  const handleCheckedChangeAllDay = React.useCallback(
    (checked: boolean) => {
      allDayControl.change(checked ? 'on' : '')

      if (!checked) return
      if (fields.startDate.value) {
        const startDate = toDate(fields.startDate.value)
        startDate.setHours(9, 0) // デフォルトは9:00
        startDateControl.change(startDate.toISOString())
      }
      if (fields.endDate.value) {
        const endDate = toDate(fields.endDate.value)
        endDate.setHours(9, 0)
        endDateControl.change(new Date(endDate).toISOString())
      }
    },
    [
      allDayControl,
      startDateControl,
      endDateControl,
      fields.startDate,
      fields.endDate,
    ],
  )

  return (
    <Form
      method="post"
      className="space-y-8"
      {...getFormProps(form)}
      action={action}
    >
      <div className="max-h-[calc(100dvh_-_240px)] space-y-8 overflow-y-auto px-0.5">
        <FormItem>
          <FormLabel htmlFor={fields.title.id}>
            {t('event.model.title')}
            <Required />
          </FormLabel>
          <InputConform meta={fields.title} type="text" />
          <FormMessage message={fields.title.errors} />
        </FormItem>
        <FormItem>
          <div className="flex flex-row space-x-6">
            <div className="basis-1/2">
              <DateTimePickerField
                label={t('event.model.start')}
                qequired={true}
                fieldMeta={fields.startDate}
                control={startDateControl}
                allDay={fields.allDay.value === 'on'}
              />
            </div>
            <div className="basis-1/2">
              <DateTimePickerField
                label={t('event.model.end')}
                qequired={false}
                fieldMeta={fields.endDate}
                control={endDateControl}
                allDay={fields.allDay.value === 'on'}
              />
            </div>
          </div>
          <div className="flex items-center">
            <Checkbox
              id={fields.allDay.id}
              checked={fields.allDay.value === 'on'}
              onCheckedChange={handleCheckedChangeAllDay}
              name={fields.allDay.id}
            />
            <FormLabel htmlFor={fields.allDay.id} className="ml-2">
              {t('event.model.all_day')}
            </FormLabel>
          </div>
          <FormMessage message={fields.allDay.errors} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.memo.id}>
            {t('event.model.memo')}
          </FormLabel>
          <TextareaConform
            meta={fields.memo}
            className="resize-none"
            rows={4}
          />
          <FormMessage message={fields.memo.errors} />
        </FormItem>
        <FormItem>
          <FormLabel htmlFor={fields.location.id}>
            {t('event.model.location')}
          </FormLabel>
          <InputConform meta={fields.location} type="text" />
          <FormMessage message={fields.location.errors} />
        </FormItem>
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </div>
      <FormFooter className="sm:justify-between">
        {children || <div>&nbsp;</div>}
        <Button type="submit">{t('common.message.save')}</Button>
      </FormFooter>
    </Form>
  )
}

interface DateTimePickerFieldProps {
  label: string
  qequired: boolean
  fieldMeta: FieldMetadata<Date | undefined>
  control: useInputControlType
  allDay: boolean
}

function DateTimePickerField({
  label,
  qequired,
  fieldMeta,
  control,
  allDay,
}: DateTimePickerFieldProps) {
  const date = fieldMeta.value ? toDate(fieldMeta.value) : undefined

  function handleChangeDate(date: Date | undefined) {
    control.change(date?.toISOString() || '')
  }

  return (
    <FormItem>
      <FormLabel htmlFor={fieldMeta.id}>
        {label}
        {qequired && <Required />}
      </FormLabel>
      <DateTimePicker
        date={date}
        allDay={allDay}
        defaultAllDay={true}
        includeAllDayComponent={false}
        onChangeDate={handleChangeDate}
        triggerId={fieldMeta.id}
      />
      <FormMessage message={fieldMeta.errors} />
    </FormItem>
  )
}
