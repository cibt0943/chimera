import { Outlet } from 'react-router'
import { SidebarProvider } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { AppSidebar } from '~/components/layouts/app-sidebar'
import { AppNavbar } from '~/components/layouts/app-navbar'
import { LoadingEffect } from '~/components/layouts/loading-effect'
import { ErrorView } from '~/components/lib/error-view'

export default function Layout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '12rem',
          '--sidebar-width-mobile': '12rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="h-dvh flex-1 overflow-auto">
        <AppNavbar />
        <main>
          <LoadingEffect>
            <Outlet />
          </LoadingEffect>
        </main>
      </div>
      <Toaster closeButton richColors />
    </SidebarProvider>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
