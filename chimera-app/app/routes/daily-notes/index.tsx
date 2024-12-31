import { isAuthenticated } from '~/lib/auth/auth-middleware'
import type { Route } from './+types/index'

export function meta() {
  return [{ title: 'DailyNotes | IMA' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginInfo = await isAuthenticated(request)

  return { loginInfo }
}

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
