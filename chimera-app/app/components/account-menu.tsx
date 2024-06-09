import { useNavigate, useFetcher } from '@remix-run/react'
import { RxGear, RxExit } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
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
import { useAccount } from '~/components/account-provider'

export function AccountMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  // const { account, isLoading } = useAccount()
  const { account } = useAccount()
  const fetcher = useFetcher()

  if (!account) return null

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
        <Button
          variant="ghost"
          className="rounded-full py-6 w-full justify-normal"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={account.picture} />
            <AvatarFallback>{account.name}</AvatarFallback>
          </Avatar>
          <span className="pl-2 truncate">{account.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>{account.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              navigate(`/account/settings`)
            }}
          >
            <RxGear className="mr-2 h-4 w-4" />
            {t('common.message.settings')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogoutClick}>
          <RxExit className="mr-2 h-4 w-4" />
          {t('account.message.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
