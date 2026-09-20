// app/routes/network-diagrams/index.tsx
import { useLoaderData } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import CollaborativeFlow from '~/components/network-diagrams/CollaborativeFlow'

export async function loader({ request }: { request: Request }) {
  const loginInfo = await isAuthenticated(request)

  // TODO: 複数の工程表を扱うようになったら、URLパラメータ (:diagramId) から
  // roomId を組み立てるようにする。今は動作確認用に固定値にしている。
  const roomId = 'diagram:1234'

  return {
    roomId,
    user: loginInfo.auth0User,
  }
}

export default function NetworkDiagramsIndexRoute() {
  const { roomId, user } = useLoaderData<typeof loader>()

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)' }}>
      <CollaborativeFlow roomId={roomId} user={user} />
    </div>
  )
}
