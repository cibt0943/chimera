import { MetaFunction, json } from '@remix-run/node'
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
      <div className="text-l mb-8 font-bold">
        This feature is under development. Please check back later.
      </div>
      Linuxコマンド操作を主としたファイラー機能の予定
    </div>
  )
}
