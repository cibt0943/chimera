import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
  return [{ title: 'files | Kobushi' }]
}

export default function Index() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">ファイル機能</h1>
      何作るか決めてない
    </div>
  )
}
