import * as React from 'react'
import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Event } from '~/types/events'
import { EventForm } from './event-form'

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) navigate('/events')
      }}
    >
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <EventForm
          event={event}
          handleSubmit={() => {
            setIsOpen(false)
          }}
        ></EventForm>
      </DialogContent>
    </Dialog>
  )
}
