import { SidebarProvider } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { AppSidebar } from '~/components/app-sidebar'
import { AppNavbar } from '~/components/app-navbar'
import { LoadingEffect } from '~/components/loading-effect'

export function Layout({ children }: { children: React.ReactNode }) {
  // return (
  //   <div className="flex">
  //     <aside className="h-dvh overflow-auto">
  //       <Sidebar />
  //     </aside>
  //     <div className="h-dvh flex-1 overflow-auto">
  //       <main>
  //         <LoadingEffect>{children}</LoadingEffect>
  //       </main>
  //     </div>
  //     <Toaster closeButton richColors />
  //   </div>
  // )

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '11rem',
          '--sidebar-width-mobile': '11rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      {/* <div className="h-dvh flex-1 overflow-auto"> */}
      <div className="h-svh flex-1 overflow-auto">
        <AppNavbar />
        <main>
          <LoadingEffect>{children}</LoadingEffect>
        </main>
      </div>
      <Toaster closeButton richColors />
    </SidebarProvider>
  )
}
