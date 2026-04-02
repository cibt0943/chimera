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
  redirectUrl: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: () => void
}

export function EventFormDialog({
  event,
  redirectUrl,
  isOpen,
  onOpenChange,
  onSubmit,
}: EventFormDialogProps) {
  const { t } = useTranslation()

  // 新規作成時であってもeventに初期値を埋めて送られてくるため、idがあるかどうかで判定
  const title = event?.id
    ? t('event.message.event_editing')
    : t('event.message.event_creation')
  const desc = t('event.message.set_event_info')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <EventForm
          event={event}
          redirectUrl={redirectUrl}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
