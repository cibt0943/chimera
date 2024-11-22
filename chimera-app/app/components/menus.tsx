import { NavLink, useLocation } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import { MenuList } from '~/lib/menu'

export function Menus() {
  const { t } = useTranslation()
  const location = useLocation()

  // urlが引数のurlから始まるかどうかを判定
  function isActive(url: string): boolean {
    return location.pathname.startsWith(url)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {MenuList.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={t(item.title)}
              >
                <NavLink to={item.url}>
                  <item.icon />
                  <span>{t(item.title)}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
