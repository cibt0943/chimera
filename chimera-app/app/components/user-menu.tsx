import { useContext } from 'react'
import { NavLink } from '@remix-run/react'
// import { useRouter } from 'next/navigation'
import { RxSun, RxMoon, RxGear, RxPerson, RxExit } from 'react-icons/rx'
import { MdBrightness4 } from 'react-icons/md'
// import { useUser } from '@auth0/nextjs-auth0/client'

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

import { ThemeContext } from '~/components/theme-provider'

export function UserMenu() {
  // const router = useRouter()
  // const { user, isLoading } = useUser()
  const { theme, upateTheme } = useContext(ThemeContext)

  // if (isLoading) return ''

  // if (!user) {
  //   return (
  //     <Button asChild>
  //       <NavLink to="/api/auth/login">Log in</NavLink>
  //     </Button>
  //   )
  // }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              {/* <AvatarImage src={user.picture || ''} />
              <AvatarFallback>{user.name}</AvatarFallback> */}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {/* <DropdownMenuLabel>{user.name}</DropdownMenuLabel> */}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
              <RxPerson className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem> */}
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
                    onValueChange={upateTheme}
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
          {/* <DropdownMenuItem onClick={() => router.push('/api/auth/logout')}>
            <RxExit className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
