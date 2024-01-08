import type { ActionFunctionArgs } from '@remix-run/node'

import { setTheme } from '~/utils/cookies'

export async function action({ request }: ActionFunctionArgs) {
  return setTheme(request)
}
