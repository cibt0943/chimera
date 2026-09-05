import { NavLink, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LuListTodo,
  LuFilePen,
  LuCalendarDays,
  LuBook,
  LuAlarmClockCheck,
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
  NETWORK_DIAGRAM_URL,
} from '~/constants'

export const FuncMenuList = [
  { title: 'todo.menu_label', url: TODO_URL, icon: LuListTodo },
  { title: 'memo.menu_label', url: MEMO_URL, icon: LuFilePen },
  { title: 'event.menu_label', url: EVENT_URL, icon: LuCalendarDays },
  {
    title: 'network_diagram.menu_label',
    url: NETWORK_DIAGRAM_URL,
    icon: LuAlarmClockCheck,
  },
  {
    title: 'daily_note.menu_label',
    url: DAILY_NOTE_URL,
    icon: LuBook,
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
                isActive={isActive(item.url)}
                tooltip={t(item.title)}
                render={
                  <NavLink to={item.url} state={{ isLoadEffect: true }} />
                }
              >
                <item.icon />
                <span>{t(item.title)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
