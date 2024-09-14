import { MetaFunction, LinksFunction, redirect } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { startOfMonth, addMonths, subMonths } from 'date-fns'
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
import { MemoSettings } from '~/types/memo-settings'
import { getEvents, insertEvent } from '~/models/event.server'
import { getTasks } from '~/models/task.server'
import { getMemos } from '~/models/memo.server'
import { ErrorView } from '~/components/lib/error-view'
import { Calendar } from '~/components/event/calendar'
import styles from '~/styles/events.css?url'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export const meta: MetaFunction = () => {
  return [{ title: 'Events | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: EventSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Error('Invalid submission data.')
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
  memoSettings: MemoSettings
}

export function getDispStartDayFromParams(request: Request): Date {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const startStr = searchParams.get('start')
  const startDate = startStr ? new Date(startStr) : new Date()
  return startOfMonth(startDate)
}

export const loader = withAuthentication(async ({ request, loginSession }) => {
  const startDay = getDispStartDayFromParams(request)
  const getStart = subMonths(startDay, 1)
  // 3ヶ月先の分まで取得
  // 2ヶ月分だと1ヶ月先に移動した際にデータ取得の前に古いデータでレンダリングされる際に情報が抜けて、
  // 最新のデータ取得後に表示されるので)
  const getEnd = addMonths(startDay, 3)

  const events = await getEvents(loginSession.account.id, {
    startDateStart: getStart,
    startDateEnd: getEnd,
  })
  const tasks = await getTasks(loginSession.account.id, {
    dueDateStart: getStart,
    dueDateEnd: getEnd,
  })
  const memos = await getMemos(loginSession.account.id, {
    relatedDateStart: getStart,
    relatedDateEnd: getEnd,
  })

  const calendarEvents: CalendarEvents = []

  // Events → CalendarEvents
  events.forEach((event) => {
    calendarEvents.push(Event2Calendar(event))
  })

  // Tasks → CalendarEvents
  tasks.forEach((task) => {
    calendarEvents.push(Task2Calendar(task as TaskWithNonNullableDueDate))
  })

  // Memos → CalendarEvents
  memos.forEach((memo) => {
    calendarEvents.push(Memo2Calendar(memo as MemoWithNonNullableRelatedDate))
  })

  return typedjson({ calendarEvents })
})

export default function Layout() {
  const { calendarEvents } = useTypedLoaderData<LoaderData>()

  return (
    <div className="p-4 pt-1 xl:pt-4">
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
