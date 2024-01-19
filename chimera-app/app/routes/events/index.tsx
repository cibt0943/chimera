import type { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.authenticate('auth0', request)
  // const user = await authenticator.isAuthenticated(request, {
  //   failureRedirect: '/login',
  // })

  return {}
}

export default function Events() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">カレンダー機能</h1>
      <ul>
        <li>カレンダーにTodoを表示</li>
        <li>カレンダーにMemoを表示</li>
        <li>カレンダーからTodoを作成</li>
      </ul>
    </div>
  )
}
