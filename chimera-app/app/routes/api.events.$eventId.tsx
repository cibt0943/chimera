import { jsonWithSuccess } from 'remix-toast'
import * as zod from 'zod'
import { parseWithZod } from '@conform-to/zod'
import { withAuthentication } from '~/lib/auth-middleware'
import { UpdateEventModel } from '~/types/events'
import { getEvent, updateEvent } from '~/models/event.server'

export const action = withAuthentication(
  async ({ params, request, loginSession }) => {
    const event = await getEvent(params.eventId || '')
    if (event.accountId !== loginSession.account.id) throw new Error('erorr')

    const formData = await request.formData()
    const submission = parseWithZod(formData, {
      schema: zod.object({
        startDate: zod.date().optional(),
        endDate: zod.date().optional(),
        allDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
      }),
    })
    // submission が成功しなかった場合、クライアントに送信結果を報告します。
    if (submission.status !== 'success') {
      console.error(submission.error)
      throw new Error('Invalid submission data.')
    }

    const data = submission.value

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

    return jsonWithSuccess({ event: updatedEvent }, '')
  },
)
