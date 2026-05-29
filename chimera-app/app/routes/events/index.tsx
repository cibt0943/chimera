import { Outlet, redirect } from 'react-router'
import { startOfMonth, addMonths, subMonths } from 'date-fns'
import { parseWithZod } from '@conform-to/zod/v4'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvents, addEvent } from '~/models/event.server'
import { getTasks } from '~/models/task.server'
import { getMemos } from '~/models/memo.server'
import { Calendar } from '~/components/event/calendar'
import styles from '~/styles/events.css?url'
import type { Route } from './+types/index'
import {
  CalendarEvents,
  Event2Calendar,
  Task2Calendar,
  Memo2Calendar,
  EventSchema,
  TaskWithNonNullableDueDate,
  MemoWithNonNullableRelatedDate,
} from '~/types/events'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

export function meta() {
  return [{ title: 'Events | IMA' }]
}

export async function action({ request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const formData = await request.formData()
  const redirectUrl = formData.get('redirectUrl')?.toString() || EVENT_URL

  const submission = parseWithZod(formData, { schema: EventSchema })
  // クライアントバリデーションを行なってるのでここでsubmissionが成功しなかった場合はエラーを返す
  if (submission.status !== 'success') {
    throw new Response('Invalid submission data.', { status: 400 })
  }

  const { startDate, endDate, allDay, title, memo, location } = submission.value

  await addEvent({
    account_id: loginInfo.account.id,
    start_datetime: startDate.toISOString(),
    end_datetime: endDate?.toISOString() ?? null,
    all_day: !!allDay,
    title,
    memo: memo ?? '',
    location: location ?? '',
  })

  return redirect(redirectUrl)
}

function getDispStartDayFromParams(request: Request): Date {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const startStr = searchParams.get('start')
  const startDate = startStr ? new Date(startStr) : new Date()
  return startOfMonth(startDate)
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const startDay = getDispStartDayFromParams(request)
  const getStart = subMonths(startDay, 1)
  // 3ヶ月先の分まで取得
  // 2ヶ月分だと1ヶ月先に移動した際にデータ取得の前に古いデータでレンダリングされる際に情報が抜けて、
  // 最新のデータ取得後に表示されるので)
  const getEnd = addMonths(startDay, 3)

  const events = await getEvents(loginInfo.account.id, {
    startDateStart: getStart,
    startDateEnd: getEnd,
  })
  const tasks = await getTasks(loginInfo.account.id, {
    dueDateStart: getStart,
    dueDateEnd: getEnd,
  })
  const memos = await getMemos(loginInfo.account.id, {
    relatedDateStart: getStart,
    relatedDateEnd: getEnd,
  })

  const calendarEvents: CalendarEvents = [
    ...events.map(Event2Calendar),
    ...tasks.map((task) => Task2Calendar(task as TaskWithNonNullableDueDate)),
    ...memos.map((memo) =>
      Memo2Calendar(memo as MemoWithNonNullableRelatedDate),
    ),
  ]

  return { calendarEvents }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { calendarEvents } = loaderData

  return (
    <div className="p-4 pt-0 md:pt-4">
      <Calendar defaultEvents={calendarEvents} />
      <Outlet />
    </div>
  )
}
