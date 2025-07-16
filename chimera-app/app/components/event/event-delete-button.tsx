import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { Event } from '~/types/events'
import { EventDeleteConfirmDialog } from './event-delete-confirm-dialog'

export interface EventDeleteButtonProps {
  event: Event | undefined
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
}

export function EventDeleteButton({
  event,
  onSubmit,
  returnUrl,
}: EventDeleteButtonProps) {
  const { t } = useTranslation()

  if (!event) return null

  return (
    <EventDeleteConfirmDialog
      event={event}
      onSubmit={onSubmit}
      returnUrl={returnUrl}
    >
      <Button type="button" variant="link" className="text-destructive px-0">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </EventDeleteConfirmDialog>
  )
}
