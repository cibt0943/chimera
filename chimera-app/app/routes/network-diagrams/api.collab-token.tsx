// app/routes/network-diagrams/api.collab-token.tsx
import jwt from 'jsonwebtoken'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { getNetworkDiagram } from '~/models/network-diagram.server'
import type { Route } from './+types/api.collab-token'

const COLLAB_JWT_SECRET = process.env.COLLAB_JWT_SECRET

if (!COLLAB_JWT_SECRET) {
  throw new Error('Missing COLLAB_JWT_SECRET environment variable')
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  const url = new URL(request.url)
  const room = url.searchParams.get('room')
  if (!room) {
    return new Response(JSON.stringify({ error: 'Missing room' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // room は "diagram:<uuid>" 形式。実際にログイン中のaccountが
  // その図の所有者かどうかをここで検証する。
  const diagramId = room.replace(/^diagram:/, '')
  const diagram = await getNetworkDiagram(loginInfo.account.id, diagramId)
  if (diagram.accountId !== loginInfo.account.id) {
    throw new Response('Forbidden', { status: 403 })
  }

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
