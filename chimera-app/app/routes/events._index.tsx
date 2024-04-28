import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Events | Kobushi' }]
}

export const loader = withAuthentication(async ({ account }) => {
  return json({ account })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">カレンダー機能</h1>
      <ul>
        <li>カレンダーにTodoを表示</li>
        <li>カレンダーにMemoを表示</li>
        <li>カレンダーからTodoを作成</li>
      </ul>
    </div>
  )
}
