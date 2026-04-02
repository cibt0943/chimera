import { redirectWithInfo } from 'remix-toast'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvent, deleteEvent } from '~/models/event.server'
import type { Route } from './+types/event.delete'

async function requireAuthorizedEvent(request: Request, eventId: string) {
  const loginInfo = await isAuthenticated(request)
  const event = await getEvent(eventId)
  if (event.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  return { event }
}

export async function action({ params, request }: Route.ActionArgs) {
  const { event } = await requireAuthorizedEvent(request, params.eventId)

  await deleteEvent(event.id)

  const formData = await request.formData()
  const redirectUrl = formData.get('redirectUrl')?.toString() || EVENT_URL
  return redirectWithInfo(redirectUrl, 'event.message.deleted')
}
