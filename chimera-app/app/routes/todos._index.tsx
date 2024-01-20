import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'todos | Kobushi' }]
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
      <h1 className="mb-2 text-xl font-bold">Todo機能</h1>
      <ul>
        <li>Todoには状態を保つ</li>
        <li>Todoには期限日を持つ</li>
        <li>期限日でカレンダーに表示</li>
        <li>一覧の表示順は自由に変更可能</li>
      </ul>
    </div>
  )
}
