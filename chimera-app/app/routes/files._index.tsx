import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Files | Kobushi' }]
}

export const loader = withAuthentication(async ({ loginSession }) => {
  return json({ loginSession })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">File</h1>
      <div className="text-l mb-8 font-bold">
        This feature is under development. Please check back later.
      </div>
      何作るか決めてない
    </div>
  )
}
