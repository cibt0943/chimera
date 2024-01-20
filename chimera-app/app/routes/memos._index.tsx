import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'memos | Kobushi' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  // const user = await authenticator.isAuthenticated(request, {
  //   failureRedirect: '/login',
  // })

  return {}
}

export default function Index() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">メモ機能</h1>
      <ul>
        <li>メモには日付情報を持つ。デフォルトは作成日で変更可能</li>
        <li>日付情報で、カレンダーに表示</li>
      </ul>
    </div>
  )
}
