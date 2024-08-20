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
import { EVENT_URL } from '~/constants'
import { sleep } from '~/lib/utils'
import { EventForm } from './event-form'
import { EventDeleteButton } from './event-delete-button'
import { Event } from '~/types/events'

export interface EventFormDialogProps {
  event: Event | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  returnUrl?: string
}

export function EventFormDialog({
  event,
  isOpen,
  setIsOpen,
  returnUrl = EVENT_URL,
}: EventFormDialogProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // 新規作成時であってもeventに初期値を埋めて送られてくるため、idがあるかどうかで判定
  const title = event?.id
    ? t('event.message.event_editing')
    : t('event.message.event_creation')
  const desc = t('event.message.set_event_info')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        setIsOpen(open)
        if (!open) {
          await sleep(200) // ダイアログが閉じるアニメーションが終わるまで待機
          navigate(returnUrl)
        }
      }}
    >
      <DialogContent className="sm:max-w-[490px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <EventForm
          event={event}
          onSubmit={() => setIsOpen(false)}
          returnUrl={returnUrl}
        >
          {event?.id && (
            <EventDeleteButton
              event={event}
              onSubmit={(event) => {
                event.stopPropagation()
                setIsOpen(false)
              }}
              returnUrl={returnUrl}
            />
          )}
        </EventForm>
      </DialogContent>
    </Dialog>
  )
}
