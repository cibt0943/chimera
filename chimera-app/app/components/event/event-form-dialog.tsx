import * as React from 'react'
import { Form, useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from '@conform-to/react'
import { parseWithZod, getZodConstraint } from '@conform-to/zod'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Required } from '~/components/lib/required'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { FormItem, FormLabel, FormMessage } from '~/components/lib/form'
import { Event, EventSchema, EventSchemaType } from '~/types/events'
import { EventDateTimePicker } from './event-date-time-picker'

export interface EventFormDialogProps {
  event: Event | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function EventFormDialog({
  event,
  isOpen,
  setIsOpen,
}: EventFormDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const title = event?.id
    ? t('event.message.event_editing')
    : t('event.message.event_creation')
  const description = t('event.message.set_event_info')
  const action = event?.id ? `/events/${event.id}` : '/events'

  const defaultValue = event

  const [form, fields] = useForm<EventSchemaType>({
    id: `event-form${event?.id ? `-${event.id}` : '-new'}`,
    defaultValue: defaultValue,
    constraint: getZodConstraint(EventSchema),
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: EventSchema })
    },
    onSubmit: () => {
      setIsOpen(false)
    },
  })

  if (!event) return null

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) navigate('/events')
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          method="post"
          className="space-y-8"
          {...getFormProps(form)}
          action={action}
        >
          <FormItem>
            <FormLabel htmlFor={fields.title.id}>
              {t('event.model.title')}
              <Required />
            </FormLabel>
            <Input {...getInputProps(fields.title, { type: 'text' })} />
            <FormMessage message={fields.title.errors} />
          </FormItem>
          <FormItem className="flex flex-col">
            <FormLabel htmlFor={fields.start.id}>
              {t('event.model.start')}
              <Required />
            </FormLabel>
            <EventDateTimePicker meta={fields.start} />
            <FormMessage message={fields.start.errors} />
          </FormItem>
          <FormItem className="flex flex-col">
            <FormLabel htmlFor={fields.end.id}>
              {t('event.model.end')}
            </FormLabel>
            <EventDateTimePicker meta={fields.end} />
            <FormMessage message={fields.end.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.memo.id}>
              {t('event.model.memo')}
            </FormLabel>
            <Textarea
              {...getTextareaProps(fields.memo)}
              className="resize-none"
            />
            <FormMessage message={fields.memo.errors} />
          </FormItem>
          <FormItem>
            <FormLabel htmlFor={fields.location.id}>
              {t('event.model.location')}
            </FormLabel>
            <Input {...getInputProps(fields.location, { type: 'text' })} />
            <FormMessage message={fields.location.errors} />
          </FormItem>
          <DialogFooter>
            <Button type="submit">{t('common.message.save')}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
