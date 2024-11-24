import { Outlet } from '@remix-run/react'
import { ErrorView } from '~/components/lib/error-view'

export default function Layout() {
  return (
    <div className="p-4 pt-1 lg:pt-4">
      <Outlet />
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
