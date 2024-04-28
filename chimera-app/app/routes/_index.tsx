import type { MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Kobushi' },
    { name: 'description', content: 'Service with 5 functions' },
  ]
}

export async function loader() {
  return redirect('/dashboard')
}
