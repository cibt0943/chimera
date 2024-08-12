import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { TODO_URL } from '~/constants'

export const meta: MetaFunction = () => {
  return [
    { title: 'Kobushi' },
    { name: 'description', content: 'Service with 5 functions' },
  ]
}

export async function loader() {
  return redirect(TODO_URL)
}
