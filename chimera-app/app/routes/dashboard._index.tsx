import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Dashboard | Kobushi' }]
}

export const loader = withAuthentication(async ({ loginSession }) => {
  return json({ loginSession })
})

export default function Index() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Dashboard</h1>
      <div className="mb-8 text-l font-bold">
        This feature is under development. Please check back later.
      </div>
    </div>
  )
}
