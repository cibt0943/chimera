// app/routes/network-diagrams/network-diagram.tsx
import { useLoaderData } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'
import CollaborativeFlow from '~/components/network-diagrams/CollaborativeFlow'

export async function loader({
  request,
  params,
}: {
  request: Request
  params: { diagramId: string }
}) {
  const loginInfo = await isAuthenticated(request)
  const supabase = createSupabaseClientForUser(loginInfo.account.id)

  // RLSにより、自分のaccount_id以外の行はそもそも返ってこない
  // (他人のIDを直打ちされても maybeSingle() が null を返すだけ)。
  const { data: diagram, error } = await supabase
    .from('network_diagrams')
    .select('id, title')
    .eq('id', params.diagramId)
    .maybeSingle()

  if (error) {
    throw new Response(error.message, { status: 500 })
  }
  if (!diagram) {
    throw new Response('Not Found', { status: 404 })
  }

  return {
    roomId: `diagram:${diagram.id}`,
    title: diagram.title,
    user: loginInfo.auth0User,
  }
}

export default function NetworkDiagramRoute() {
  const { roomId, title, user } = useLoaderData<typeof loader>()

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <h1 style={{ padding: '8px 16px', margin: 0 }}>{title || '(無題)'}</h1>
      <div style={{ width: '100%', height: 'calc(100% - 48px)' }}>
        <CollaborativeFlow roomId={roomId} user={user} />
      </div>
    </div>
  )
}
