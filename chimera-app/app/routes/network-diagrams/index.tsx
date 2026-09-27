// app/routes/network-diagrams/index.tsx
import { Form, Link, useLoaderData } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'

export async function loader({ request }: { request: Request }) {
  const loginInfo = await isAuthenticated(request)
  const supabase = createSupabaseClientForUser(loginInfo.account.id)

  // RLSポリシー(auth.uid() = account_id)により、自分のaccount_idの行しか
  // 返ってこない。nodesはプレビュー用(件数表示など)に使う。
  const { data: diagrams, error } = await supabase
    .from('network_diagrams')
    .select('id, title, nodes, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Response(error.message, { status: 500 })
  }

  return { diagrams: diagrams ?? [] }
}

export default function NetworkDiagramsIndexRoute() {
  const { diagrams } = useLoaderData<typeof loader>()

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1>ネットワーク図</h1>
        <Form method="post" action="/network-diagrams/create">
          <button type="submit">＋ 新規作成</button>
        </Form>
      </div>

      {diagrams.length === 0 ? (
        <p>
          まだネットワーク図がありません。「＋ 新規作成」から作成してください。
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {diagrams.map((diagram) => {
            const nodeCount = Array.isArray(diagram.nodes)
              ? diagram.nodes.length
              : 0
            return (
              <li
                key={diagram.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <Link to={`/network-diagrams/${diagram.id}`}>
                  {diagram.title || '(無題のネットワーク図)'}
                </Link>
                <span style={{ color: '#888', fontSize: 12 }}>
                  ノード数: {nodeCount} / 更新:{' '}
                  {new Date(diagram.updated_at).toLocaleString('ja-JP')}
                </span>
                <Form
                  method="post"
                  action={`/network-diagrams/${diagram.id}/delete`}
                >
                  <button type="submit">削除</button>
                </Form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
