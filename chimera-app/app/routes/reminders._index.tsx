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
      <div className="text-l mb-8 font-bold">
        This feature is under development. Please check back later.
      </div>
      モバイル端末でTodoやEventのリマインダ通知を受信できるようにする予定
    </div>
  )
}
