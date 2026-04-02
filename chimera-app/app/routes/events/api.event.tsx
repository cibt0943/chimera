import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvent, updateEvent } from '~/models/event.server'
import type { Route } from './+types/api.event'
import type { UpdateEventModel } from '~/models/event.server'

const UpdateEventSchema = zod.object({
  startDate: zod.preprocess((v) => new Date(String(v)), zod.date()).optional(),
  endDate: zod.preprocess((v) => new Date(String(v)), zod.date()).optional(),
  allDay: zod
    .preprocess(
      (v) => (typeof v === 'boolean' ? v : String(v) === 'on'),
      zod.boolean(),
    )
    .optional(),
})

async function requireAuthorizedEvent(request: Request, eventId: string) {
  const loginInfo = await isAuthenticated(request)
  const event = await getEvent(eventId)
  if (event.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { event }
}

// イベントの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const { event } = await requireAuthorizedEvent(request, params.eventId)

  const jsonData = await request.json()
  const submission = UpdateEventSchema.safeParse(jsonData)

  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (!submission.success) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const values: UpdateEventModel = { id: event.id }
  const data = submission.data

  if (data.startDate !== undefined) {
    const endDate = !data.endDate
      ? null
      : data.startDate.getTime() === data.endDate.getTime()
        ? null
        : data.endDate

    values.start_datetime = data.startDate.toISOString()
    values.end_datetime = endDate?.toISOString() || null
    values.all_day = !!data.allDay
  }

  const updatedEvent = await updateEvent(values)

  return Response.json({ event: updatedEvent })
}
