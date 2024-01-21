import { Outlet } from '@remix-run/react'

export default function Layout() {
  return (
    <div className="p-4">
      {/* <div>
        <h1 className="mb-2 text-xl font-bold">Todo機能</h1>
        <ul>
          <li>Todoには状態を保つ</li>
          <li>Todoには期限日を持つ</li>
          <li>期限日でカレンダーに表示</li>
          <li>一覧の表示順は自由に変更可能</li>
        </ul>
      </div> */}

      <Outlet />
    </div>
  )
}
