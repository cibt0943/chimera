import type { MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { withAuthentication } from '~/lib/auth-middleware'

export const meta: MetaFunction = () => {
  return [{ title: 'Memos | Kobushi' }]
}

export const loader = withAuthentication(async ({ account }) => {
  return json({ account })
})

export default function Index() {
  return (
    <div>
      <h1 className="mb-2 text-xl font-bold">メモ機能</h1>
      <ul>
        <li>メモには日付情報を持つ。デフォルトは作成日で変更可能</li>
        <li>日付情報で、カレンダーに表示</li>
      </ul>
    </div>
  )
}
