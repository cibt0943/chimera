import { redirectWithInfo } from 'remix-toast'
import { EVENT_URL } from '~/constants'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getEvent, deleteEvent } from '~/models/event.server'
import type { Route } from './+types/event.delete'

export async function action({ params, request }: Route.ActionArgs) {
  const loginInfo = await isAuthenticated(request)

  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

  await deleteEvent(event.id)

  const formData = await request.formData()
  const returnUrl = formData.get('returnUrl') as string | null
  return redirectWithInfo(returnUrl || EVENT_URL, 'event.message.deleted')
}
