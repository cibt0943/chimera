import * as zod from 'zod'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvent, updateEvent } from '~/models/event.server'
import type { Route } from './+types/api.event'
import { UpdateEventModel } from '~/types/events'

// イベントの更新API（送られてきた値のみを更新）
export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  const jsonData = await request.json()

  const scheme = zod.object({
    startDate: zod.preprocess((v) => new Date(v), zod.date()).optional(),
    endDate: zod.preprocess((v) => new Date(v), zod.date()).optional(),
    allDay: zod.preprocess((v) => v === 'on', zod.boolean()).optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
  })

  const submission = scheme.safeParse(jsonData)

  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (!submission.success) {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const data = submission.data

  const values: UpdateEventModel = { id: event.id }
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
