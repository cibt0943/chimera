import { NavLink, useLocation } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  LuListTodo,
  LuFileEdit,
  LuCalendarDays,
  LuBook,
  LuAlarmCheck,
} from 'react-icons/lu'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import {
  TODO_URL,
  MEMO_URL,
  EVENT_URL,
  DAILY_NOTE_URL,
  REMINDER_URL,
} from '~/constants'

export const FuncMenuList = [
  { title: 'todo.menu_label', url: TODO_URL, icon: LuListTodo },
  { title: 'memo.menu_label', url: MEMO_URL, icon: LuFileEdit },
  { title: 'event.menu_label', url: EVENT_URL, icon: LuCalendarDays },
  {
    title: 'daily_note.menu_label',
    url: DAILY_NOTE_URL,
    icon: LuBook,
  },
  {
    title: 'reminder.menu_label',
    url: REMINDER_URL,
    icon: LuAlarmCheck,
  },
]

export function SidebarFuncMenu() {
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
          {FuncMenuList.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={t(item.title)}
              >
                <NavLink to={item.url} state={{ isLoadEffect: true }}>
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
