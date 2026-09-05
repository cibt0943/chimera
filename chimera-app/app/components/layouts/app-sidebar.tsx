import { NavLink } from 'react-router'
import { LuFlameKindling } from 'react-icons/lu'
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
import { SidebarFuncMenu } from '~/components/layouts/sidebar-func-menu'
import { SidebarAccountMenu } from '~/components/layouts/sidebar-account-menu'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center">
            <SidebarMenuButton
              className={'group-data-[collapsible=icon]:p-0!'}
              render={<NavLink to="/" className="font-bold text-yellow-500!" />}
            >
              <LuFlameKindling />
              <span>IMA</span>
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
