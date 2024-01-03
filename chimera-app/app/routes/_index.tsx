import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [
    { title: 'Kobushi' },
    { name: 'description', content: 'Service with 5 functions' },
  ]
}

export default function Home() {
  return (
    <div>
      <h1>5つの機能を持つようにしようと思っています。</h1>
    </div>
  )
}
