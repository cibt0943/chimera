import { redirect } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { getEvent, deleteEvent } from '~/models/event.server'

export const action = withAuthentication(async ({ params, loginSession }) => {
  const event = await getEvent(params.eventId || '')
  if (event.accountId !== loginSession.account.id) throw new Error('erorr')

  await deleteEvent(event.id)

  return redirect(`/events`)
})
