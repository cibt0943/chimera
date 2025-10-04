import { useTranslation } from 'react-i18next'
import { LuTrash2 } from 'react-icons/lu'
import { Button } from '~/components/ui/button'
import { Event } from '~/types/events'
import { EventDeleteConfirmDialog } from './event-delete-confirm-dialog'

export interface EventDeleteButtonProps {
  event: Event | undefined
  redirectUrl: string
}

export function EventDeleteButton({
  event,
  redirectUrl,
}: EventDeleteButtonProps) {
  const { t } = useTranslation()

  if (!event) return null

  return (
    <EventDeleteConfirmDialog event={event} redirectUrl={redirectUrl}>
      <Button type="button" variant="link" className="text-destructive px-0">
        <LuTrash2 />
        {t('common.message.delete')}
      </Button>
    </EventDeleteConfirmDialog>
  )
}
