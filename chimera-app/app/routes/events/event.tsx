import * as React from 'react'
import { redirect, useLocation } from 'react-router'
import { parseWithZod } from '@conform-to/zod'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvent, updateEvent } from '~/models/event.server'
import { EventFormDialog } from '~/components/event/event-form-dialog'
import type { Route } from './+types/event'
import { EventSchema } from '~/types/events'

export function meta({ data }: Route.MetaArgs) {
  return [{ title: 'Event ' + data?.event.id + ' Edit | IMA' }]
}

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginInfo.account.id) throw new Error('erorr')

  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: EventSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
  }

  const data = submission.value

  const endDate = !data.endDate
    ? null
    : data.startDate.getTime() === data.endDate.getTime()
      ? null
      : data.endDate

  await updateEvent({
    id: event.id,
    title: data.title,
    start_datetime: data.startDate.toISOString(),
    end_datetime: endDate?.toISOString() || null,
    all_day: !!data.allDay,
    memo: data.memo || '',
    location: data.location || '',
  })

  const redirectUrl = (formData.get('returnUrl') as string) || EVENT_URL
  return redirect(redirectUrl)
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginInfo.account.id) throw new Error('erorr')

  return { event }
}

export default function Event({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)
  const location = useLocation()

  return (
    <EventFormDialog
      event={event}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
      returnUrl={EVENT_URL + location.search}
    />
  )
}
