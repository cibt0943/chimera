import { useNavigate, useFetcher } from '@remix-run/react'
import { RiUserSettingsLine, RiLogoutBoxRLine } from 'react-icons/ri'
import { useTranslation } from 'react-i18next'
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
import { useAtomValue } from 'jotai'
import { loginSessionAtom } from '~/lib/state'

export function AccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  // ログインユーザーのアカウント情報をグローバルステートから取得
  const loginSession = useAtomValue(loginSessionAtom)
  if (!loginSession) return null

  const handleLogoutClick = () => {
    fetcher.submit(
      {},
      {
        action: '/auth/logout',
        method: 'post',
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={loginSession.auth0User.picture} />
          <AvatarFallback>{loginSession.auth0User.name}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{loginSession.auth0User.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              navigate(`/account/settings`)
            }}
          >
            <RiUserSettingsLine className="mr-2 h-4 w-4" />
            {t('common.message.settings')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick}>
          <RiLogoutBoxRLine className="mr-2 h-4 w-4" />
          {t('account.message.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
