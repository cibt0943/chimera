import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard | Kobushi' }]
}

export const loader = withAuthentication(async ({ account }) => {
  return json({ account })
})

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1>ダッシュボード機能を実装する予定</h1>
    </div>
  )
}
