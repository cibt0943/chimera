import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'
import { themeCookie } from '~/lib/cookies.server'

function addYear(date: Date, year: number) {
  date.setFullYear(date.getFullYear() + year)
  return date
}

export const action = withAuthentication(async ({ request }) => {
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
})
