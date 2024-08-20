import { MetaFunction, LinksFunction, redirect } from '@remix-run/node'
import { Outlet, useParams } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { parseWithZod } from '@conform-to/zod'
import { EVENT_URL } from '~/constants'
import { withAuthentication } from '~/lib/auth-middleware'
import {
  CalendarEvents,
  Event2Calendar,
  Task2Calendar,
  Memo2Calendar,
  EventSchema,
  TaskWithNonNullableDueDate,
  MemoWithNonNullableRelatedDate,
} from '~/types/events'
import { getEvents, insertEvent } from '~/models/event.server'
import { getTasks } from '~/models/task.server'
import { getMemos } from '~/models/memo.server'
import { ErrorView } from '~/components/lib/error-view'
import { Calendar } from '~/components/event/calendar'
import styles from '~/styles/events.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export const meta: MetaFunction = () => {
  return [{ title: 'Events | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: EventSchema })
  // submission が成功しなかった場合、クライアントに送信結果を報告します。
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
    // return json({ result: submission.reply() }, { status: 422 })
  }

  const data = submission.value

  await insertEvent({
    account_id: loginSession.account.id,
    start_datetime: data.startDate.toISOString(),
    end_datetime: data.endDate?.toISOString() || null,
    all_day: !!data.allDay,
    title: data.title,
    memo: data.memo || '',
    location: data.location || '',
  })

  const redirectUrl = (formData.get('returnUrl') as string) || EVENT_URL
  return redirect(redirectUrl)
})

type LoaderData = {
  calendarEvents: CalendarEvents
}

export const loader = withAuthentication(async ({ loginSession }) => {
  const events = await getEvents(loginSession.account.id)
  const tasks = await getTasks(loginSession.account.id)
  const memos = await getMemos(loginSession.account.id)

  const calendarEvents: CalendarEvents = []

  // Events → CalendarEvents
  events.forEach((event) => {
    calendarEvents.push(Event2Calendar(event))
  })

  // Tasks → CalendarEvents
  tasks.forEach((task) => {
    if (!task.dueDate) return
    calendarEvents.push(Task2Calendar(task as TaskWithNonNullableDueDate))
  })

  // Memos → CalendarEvents
  memos.forEach((memo) => {
    if (!memo.relatedDate) return
    calendarEvents.push(Memo2Calendar(memo as MemoWithNonNullableRelatedDate))
  })

  return typedjson({ calendarEvents })
})

export default function Layout() {
  const { calendarEvents } = useTypedLoaderData<LoaderData>()

  return (
    <div className="p-4">
      <Calendar defaultEvents={calendarEvents} />
      <Outlet />
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
