import type { MetaFunction, LinksFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Outlet, useParams } from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { withAuthentication } from '~/lib/auth-middleware'
import { Events } from '~/types/events'
import { getEvents } from '~/models/event.server'
import { ErrorView } from '~/components/lib/error-view'
import { Calendar } from '~/components/event/calendar'
import styles from '~/styles/events.css'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

export const meta: MetaFunction = () => {
  return [{ title: 'Events | Kobushi' }]
}

export const action = withAuthentication(async ({ request, loginSession }) => {
  return redirect('/events')
})

type LoaderData = {
  events: Events
}

export const loader = withAuthentication(async ({ loginSession }) => {
  const events = await getEvents(loginSession.account.id)

  return typedjson({ events })
})

export default function Layout() {
  const { events } = useTypedLoaderData<LoaderData>()

  const params = useParams()
  const { eventId } = params

  return (
    <div className="p-4">
      <Calendar defaultEvents={events} showId={eventId || ''} />
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
