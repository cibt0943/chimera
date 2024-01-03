import { createCookieSessionStorage } from '@remix-run/node'

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === 'production'

const sessionName = process.env.SESSION_NAME || '__session'
const sessionSecret = process.env.SESSION_SECRET || 'chimera4649'

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: sessionName,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: [sessionSecret],
    domain: process.env.DOMAIN,
    // Set secure only if in production
    secure: isProduction,
  },
})

export const { getSession, commitSession, destroySession } = sessionStorage

// CookieSessionから自分のSessionを取得
export const getCurrentSession = (request: Request) => {
  const cookie = request.headers.get('cookie')
  return getSession(cookie)
}
