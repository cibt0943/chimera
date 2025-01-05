import { Outlet } from 'react-router'

export default function Index() {
  return (
    <div className="p-4 pt-0 lg:pt-4">
      <Outlet />
    </div>
  )
}
