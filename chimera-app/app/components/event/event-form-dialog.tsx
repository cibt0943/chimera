import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { EVENT_URL } from '~/constants'
import { Event } from '~/types/events'
import { EventForm } from './event-form'

export interface EventFormDialogProps {
  event: Event | undefined
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  returnUrl?: string
}

export function EventFormDialog({
  event,
  isOpen,
  onOpenChange,
  returnUrl = EVENT_URL,
}: EventFormDialogProps) {
  const { t } = useTranslation()

  // 新規作成時であってもeventに初期値を埋めて送られてくるため、idがあるかどうかで判定
  const title = event?.id
    ? t('event.message.event_editing')
    : t('event.message.event_creation')
  const desc = t('event.message.set_event_info')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <EventForm
          event={event}
          onSubmit={() => onOpenChange(false)}
          returnUrl={returnUrl}
        />
      </DialogContent>
    </Dialog>
  )
}
