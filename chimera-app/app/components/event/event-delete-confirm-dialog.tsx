import * as React from 'react'
import { Form } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { AlertDialogCancel } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { DeleteConfirmDialog } from '~/components/lib/delete-confirm-dialog'
import { Event } from '~/types/events'

export interface EventDeleteConfirmDialogProps {
  event: Event | undefined
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function EventDeleteConfirmDialog({
  event,
  isOpen,
  setIsOpen,
}: EventDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!event) return null
  return (
    <DeleteConfirmDialog
      title={t('event.message.event_deletion')}
      description={
        '「' + event.title + '」' + t('common.message.confirm_deletion')
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <Form
        action={`/events/${event.id}/delete`}
        method="delete"
        onSubmit={() => {
          setIsOpen(false)
        }}
      >
        <Button type="submit" variant="destructive">
          {t('common.message.delete')}
        </Button>
      </Form>
    </DeleteConfirmDialog>
  )
}
