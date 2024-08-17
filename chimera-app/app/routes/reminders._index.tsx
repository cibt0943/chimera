import { MetaFunction, json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Reminders | Kobushi' }]
}

export const loader = withAuthentication(async ({ loginSession }) => {
  return json({ loginSession })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Reminder</h1>
      <div className="text-l mb-8 font-bold">
        This feature is under development. Please check back later.
      </div>
      Push通知を受け取るためだけのモバイルアプリを作ってみようかな
    </div>
  )
}
