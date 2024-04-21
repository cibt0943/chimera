import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Kobushi' },
    { name: 'description', content: 'Service with 5 functions' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect('/dashboard')
}
