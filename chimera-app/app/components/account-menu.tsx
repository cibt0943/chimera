import { useNavigate, Form, useFetcher } from '@remix-run/react'
import { RxSun, RxMoon, RxGear, RxPerson, RxExit } from 'react-icons/rx'
import { MdBrightness4 } from 'react-icons/md'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '~/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

import { useTheme, Theme } from '~/components/theme-provider'
import { useAccount } from '~/components/account-provider'

export function AccountMenu() {
  const navigate = useNavigate()
  const { theme, updateTheme } = useTheme()
  // const { account, isLoading } = useAccount()
  const { account } = useAccount()
  const fetcher = useFetcher()

  // if (isLoading) return ''

  if (!account) {
    return (
      <div className="mx-4">
        <Form action="/auth/auth0" method="post">
          <Button variant="destructive">Log in</Button>
        </Form>
      </div>
    )
  }

  const handleValueChange = (theme: string) => {
    updateTheme(theme as Theme)
  }

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
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full py-6 w-full justify-normal"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={account.picture}></AvatarImage>
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
                navigate(`/account/profile`)
              }}
            >
              <RxPerson className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MdBrightness4 className="mr-2 h-4 w-4" />
                Mode
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent hideWhenDetached={true}>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={handleValueChange}
                  >
                    <DropdownMenuRadioItem value="light">
                      <RxSun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <RxMoon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <RxGear className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogoutClick}>
            <RxExit className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
