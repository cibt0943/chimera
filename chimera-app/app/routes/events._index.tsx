import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Events | Kobushi' }]
}

export const loader = withAuthentication(async ({ loginSession }) => {
  return json({ loginSession })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Event Calendar</h1>
      <div className="mb-8 text-l font-bold">
        This feature is under development. Please check back later.
      </div>
      <ul>
        <li>カレンダーにTodoを表示</li>
        <li>カレンダーにMemoを表示</li>
        <li>カレンダーからTodoを作成</li>
      </ul>
    </div>
  )
}
