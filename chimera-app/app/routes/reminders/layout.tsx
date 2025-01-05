import { Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="p-4 pt-0 lg:pt-4">
      <Outlet />
    </div>
  )
}
