import { redirect } from 'react-router'
import { TODO_URL } from '~/constants'

export function meta() {
  return [
    { title: 'ima' },
    { name: 'description', content: 'Service with 5 functions' },
  ]
}

export async function loader() {
  return redirect(TODO_URL)
}
