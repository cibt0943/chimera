import * as React from 'react'
import { Form } from 'react-router'
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
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function EventDeleteConfirmDialog({
  event,
  isOpen,
  onOpenChange,
  onSubmit,
  returnUrl = EVENT_URL,
  children,
}: EventDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!event) return null

  const action = `${EVENT_URL}/${event.id}/delete`
  const desc = '「' + event.title + '」' + t('common.message.confirm_deletion')

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
        type="submit"
        className={buttonVariants({ variant: 'destructive' })}
        form="delete-event-form"
      >
        {t('common.message.delete')}
      </AlertDialogAction>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <Form
        id="delete-event-form"
        action={action}
        method="delete"
        onSubmit={(event) => {
          event.stopPropagation() // これがないと「The submit event is dispatched by form#delete-event-form instead of 〜」というエラーが出る
          onSubmit && onSubmit(event)
        }}
      >
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </ConfirmDialog>
  )
}
