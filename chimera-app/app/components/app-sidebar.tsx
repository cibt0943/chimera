import { NavLink } from '@remix-run/react'
import { LuBird } from 'react-icons/lu'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
  SidebarTrigger,
} from '~/components/ui/sidebar'
import { SidebarFuncMenu } from '~/components/sidebar-func-menu'
import { SidebarAccountMenu } from '~/components/sidebar-account-menu'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton
              asChild
              className={'group-data-[collapsible=icon]:!p-0'}
            >
              <NavLink to="/" className="font-bold">
                <LuBird className="!h-5 !w-4 text-yellow-500" />
                <LuBird className="!h-5 !w-5 text-yellow-500" />
                <span className="text-yellow-500">I forgot.</span>
              </NavLink>
            </SidebarMenuButton>
            <SidebarTrigger className="p-4" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarFuncMenu />
      </SidebarContent>
      <SidebarFooter>
        <SidebarAccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
