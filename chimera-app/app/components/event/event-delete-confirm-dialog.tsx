import * as React from 'react'
import { useFetcher } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  AlertDialogCancel,
  AlertDialogAction,
} from '~/components/ui/alert-dialog'
import { buttonVariants } from '~/components/ui/button'
import { EVENT_URL } from '~/constants'
import { ConfirmDialog } from '~/components/lib/confirm-dialog'
import { Event } from '~/types/events'

export interface EventDeleteConfirmDialogProps {
  event: Event | undefined
  redirectUrl: string
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function EventDeleteConfirmDialog({
  event,
  redirectUrl,
  isOpen,
  onOpenChange,
  children,
}: EventDeleteConfirmDialogProps) {
  const { t } = useTranslation()
  const fetcher = useFetcher()

  if (!event) return null

  const desc = '「' + event.title + '」' + t('common.message.confirm_deletion')
  const action = `${EVENT_URL}/${event.id}/delete`

  return (
    <ConfirmDialog
      title={t('event.message.event_deletion')}
      description={desc}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      torigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      <AlertDialogAction
        className={buttonVariants({ variant: 'destructive' })}
        onClick={() =>
          fetcher.submit({ redirectUrl }, { method: 'delete', action })
        }
      >
        {t('common.message.delete')}
      </AlertDialogAction>
    </ConfirmDialog>
  )
}
