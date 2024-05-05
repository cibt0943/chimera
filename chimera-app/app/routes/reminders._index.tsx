import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Reminders | Kobushi' }]
}

export const loader = withAuthentication(async ({ account }) => {
  return json({ account })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">リマインダー機能</h1>
      <ul>
        <li>携帯にPush通知</li>
        <li></li>
      </ul>
    </div>
  )
}
