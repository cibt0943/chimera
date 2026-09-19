// app/routes/network-diagrams/api.collab-token.tsx
//
// Issues a short-lived JWT that the browser can use to authenticate its
// WebSocket connection to the collab (y-websocket) server. The collab
// server verifies this token using the same shared secret (HMAC),
// so it never needs to talk to Auth0 directly.
//
// GET /api/collab-token?room=diagram:123

import jwt from 'jsonwebtoken'
import { isAuthenticated } from '~/lib/auth/auth-middleware'

const COLLAB_JWT_SECRET = process.env.COLLAB_JWT_SECRET

if (!COLLAB_JWT_SECRET) {
  throw new Error('Missing COLLAB_JWT_SECRET environment variable')
}

export async function loader({ request }: { request: Request }) {
  // Reuses the existing session check — redirects to /login if not authenticated.
  const loginInfo = await isAuthenticated(request)

  const url = new URL(request.url)
  const room = url.searchParams.get('room')
  if (!room) {
    return new Response(JSON.stringify({ error: 'Missing room' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // TODO: check here that loginInfo.account actually has access to `room`
  // (the specific diagram), the same way you'd authorize any other resource.

  const token = jwt.sign(
    {
      sub: loginInfo.auth0User.sub,
      room,
    },
    COLLAB_JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5m' },
  )

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
