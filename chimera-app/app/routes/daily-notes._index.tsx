import { MetaFunction, json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'DailyNotes | Kobushi' }]
}

export const loader = withAuthentication(async ({ loginSession }) => {
  return json({ loginSession })
})

export default function Index() {
  return (
    <div>
      <div className="text-l mb-8 font-bold">
        This feature is under development. Please check back later.
      </div>
      普通の日記帳
    </div>
  )
}
