import { Outlet } from 'react-router'
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'
import { AppSidebar } from '~/components/layouts/app-sidebar'
import { AppNavbar } from '~/components/layouts/app-navbar'
import { LoadingEffect } from '~/components/layouts/loading-effect'
import { ErrorView } from '~/components/lib/error-view'

export default function Layout() {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '12rem',
            '--sidebar-width-mobile': '12rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <AppNavbar />
          <LoadingEffect>
            <Outlet />
          </LoadingEffect>
        </SidebarInset>
        <Toaster closeButton richColors />
      </SidebarProvider>
    </TooltipProvider>
  )
}

export function ErrorBoundary() {
  return (
    <div className="p-4">
      <ErrorView />
    </div>
  )
}
