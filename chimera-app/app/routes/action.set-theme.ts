import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'

import { themeCookie } from '~/lib/cookies'

function addYear(date: Date, year: number) {
  date.setFullYear(date.getFullYear() + year)
  return date
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie')
  const cookie = (await themeCookie.parse(cookieHeader)) || {}
  const { theme } = await request.json()
  cookie.theme = theme

  return json(theme, {
    headers: {
      'Set-Cookie': await themeCookie.serialize(cookie, {
        expires: addYear(new Date(), 1),
      }),
    },
  })
}
