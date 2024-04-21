import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard | Kobushi' }]
}

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1>ダッシュボード機能を実装する予定</h1>
    </div>
  )
}
