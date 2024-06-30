import { createCookieSessionStorage } from '@remix-run/node'

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === 'production'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: process.env.SESSION_NAME!,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET!],
    // domain: process.env.DOMAIN,
    // Set secure only if in production
    secure: isProduction,
  },
})

export const { getSession, commitSession, destroySession } = sessionStorage
