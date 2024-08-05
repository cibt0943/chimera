import * as React from 'react'
import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { Event, EventSchema } from '~/types/events'
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
      // return json({ result: submission.reply() }, { status: 422 })
    }

    const data = submission.value

    await updateEvent({
      id: event.id,
      title: data.title,
      start_datetime: data.startDate.toISOString(),
      end_datetime: data.endDate?.toISOString() || null,
      all_day: !!data.allDay,
      memo: data.memo || '',
      location: data.location || '',
    })

    return redirect('/events')
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

export default function Todo() {
  const { event } = useTypedLoaderData<LoaderData>()
  const [isOpenDialog, setIsOpenDialog] = React.useState(true)

  return (
    <EventFormDialog
      event={event}
      isOpen={isOpenDialog}
      setIsOpen={setIsOpenDialog}
    />
  )
}
