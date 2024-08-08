import * as React from 'react'
import { useNavigate } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { EventDeleteConfirmDialog } from './event-delete-confirm-dialog'
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
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false)

  // 新規作成時であってもeventに初期値を埋めて送られてくるため、idがあるかどうかで判定
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
        <EventForm event={event} onSubmit={() => setIsOpen(false)}>
          {event?.id && (
            <Button
              type="button"
              variant="link"
              className="border-destructive/50 px-0 text-destructive"
              onClick={() => setIsOpenDeleteDialog(true)}
            >
              <RiDeleteBinLine className="mr-1 h-4 w-4" />
              {t('common.message.delete')}
            </Button>
          )}
        </EventForm>
        <EventDeleteConfirmDialog
          event={event}
          isOpen={isOpenDeleteDialog}
          setIsOpen={setIsOpenDeleteDialog}
          onSubmit={() => {
            setIsOpenDeleteDialog(false)
            setIsOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
