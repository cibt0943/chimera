import * as React from 'react'
import { Form } from '@remix-run/react'
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
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  returnUrl?: string
  children?: React.ReactNode
}

export function EventDeleteConfirmDialog({
  event,
  isOpen,
  setIsOpen,
  onSubmit,
  returnUrl = EVENT_URL,
  children,
}: EventDeleteConfirmDialogProps) {
  const { t } = useTranslation()

  if (!event) return null

  const action = [EVENT_URL, event.id, 'delete'].join('/')
  const desc = '「' + event.title + '」' + t('common.message.confirm_deletion')

  return (
    <ConfirmDialog
      title={t('event.message.event_deletion')}
      description={desc}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      torigger={children}
    >
      <AlertDialogCancel>{t('common.message.cancel')}</AlertDialogCancel>
      {/* レスポンシブ対応のためにFormでButtonを囲まない */}
      <AlertDialogAction
        type="submit"
        className={buttonVariants({ variant: 'destructive' })}
        form="delete-event-form"
      >
        {t('common.message.delete')}
      </AlertDialogAction>
      <Form
        id="delete-event-form"
        action={action}
        method="delete"
        onSubmit={onSubmit}
      >
        <input type="hidden" name="returnUrl" value={returnUrl} />
      </Form>
    </ConfirmDialog>
  )
}
