import { useNavigate, useFetcher } from 'react-router'
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
import { useLoginInfoAtom } from '~/lib/global-state'

export function SidebarAccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  // ログインユーザーのアカウント情報をグローバルステートから取得
  const loginInfo = useLoginInfoAtom()
  if (!loginInfo) return null

  function handleUerSettingsClick() {
    const url = `${ACCOUNT_URL}/settings`
    navigate(url)
  }

  function handleLogoutClick() {
    const url = `${AUTH_URL}/logout`
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
                  src={loginInfo.auth0User.picture}
                  alt={loginInfo.auth0User.name}
                />
                <AvatarFallback>{loginInfo.auth0User.name}</AvatarFallback>
              </Avatar>
              <span>{loginInfo.auth0User.name}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{loginInfo.auth0User.name}</DropdownMenuLabel>
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
