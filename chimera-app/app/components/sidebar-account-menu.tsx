import { useNavigate, useFetcher } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { LuUserRoundCog, LuLogOut } from 'react-icons/lu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { AUTH_URL, ACCOUNT_URL } from '~/constants'
import { useLoginSessionAtom } from '~/lib/global-state'

export function SidebarAccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  // ログインユーザーのアカウント情報をグローバルステートから取得
  const loginSession = useLoginSessionAtom()
  if (!loginSession) return null

  function handleUerSettingsClick() {
    const url = [ACCOUNT_URL, 'settings'].join('/')
    navigate(url)
  }

  function handleLogoutClick() {
    const url = [AUTH_URL, 'logout'].join('/')
    fetcher.submit(null, { method: 'post', action: url })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={loginSession.auth0User.picture}
                  alt={loginSession.auth0User.name}
                />
                <AvatarFallback>{loginSession.auth0User.name}</AvatarFallback>
              </Avatar>
              <span>{loginSession.auth0User.name}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{loginSession.auth0User.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={handleUerSettingsClick}>
                <LuUserRoundCog />
                {t('common.message.settings')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogoutClick}>
              <LuLogOut />
              {t('account.message.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
