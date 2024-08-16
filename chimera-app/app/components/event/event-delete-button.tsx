import { useTranslation } from 'react-i18next'
import { RiDeleteBinLine } from 'react-icons/ri'
import { Button } from '~/components/ui/button'
import { Event } from '~/types/events'
import { EventDeleteConfirmDialog } from './event-delete-confirm-dialog'

export interface EventDeleteButtonProps {
  event: Event | undefined
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function EventDeleteButton({ event, onSubmit }: EventDeleteButtonProps) {
  const { t } = useTranslation()

  if (!event) return null

  return (
    <EventDeleteConfirmDialog event={event} onSubmit={onSubmit}>
      <Button
        type="button"
        variant="link"
        className="mt-2 border-destructive/50 px-0 text-destructive sm:mt-0"
      >
        <RiDeleteBinLine className="mr-1 h-4 w-4" />
        {t('common.message.delete')}
      </Button>
    </EventDeleteConfirmDialog>
  )
}
