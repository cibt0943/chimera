import * as React from 'react'
import { MetaFunction, redirect } from '@remix-run/node'
import { useLocation } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { EVENT_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import type { Event } from '~/types/events'
import { EventSchema } from '~/types/events'
import { getEvent, updateEvent } from '~/models/event.server'
import { EventFormDialog } from '~/components/event/event-form-dialog'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: 'Event ' + data?.event.id + ' Edit | Kobushi' }]
}

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const event = await getEvent(params.eventId || '')
    if (event.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, { schema: EventSchema })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
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
  },
)

type LoaderData = {
  event: Event
}

export const loader = withAuthentication(async ({ params, loginSession }) => {
  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginSession.account.id) throw new Error('erorr')

  return typedjson({ event })
})

export default function Event() {
  const { event } = useTypedLoaderData<LoaderData>()
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
