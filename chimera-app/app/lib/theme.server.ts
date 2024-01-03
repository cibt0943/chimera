import { json } from '@remix-run/node'
import { commitSession, getCurrentSession } from './session.server'

const THEME_KEY = 'theme'

export const getThemeFromCookie = async (request: Request) => {
  const session = await getCurrentSession(request)
  const theme = session.get(THEME_KEY) || 'system'
  return theme
}

export const createThemeCookie = async (request: Request, theme: string) => {
  const session = await getCurrentSession(request)
  session.set(THEME_KEY, theme)
  const headers = new Headers({
    'Set-Cookie': await commitSession(session),
  })
  console.log(headers)

  return json(
    { theme },
    {
      headers,
    },
  )
}
