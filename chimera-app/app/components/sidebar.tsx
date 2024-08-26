import { NavLink } from '@remix-run/react'
import { PiHandFistBold } from 'react-icons/pi'
import { Menus } from '~/components/menus'
import { AccountMenu } from '~/components/account-menu'

export function Sidebar() {
  return (
    <div className="hidden h-full w-44 px-2 lg:flex lg:flex-col">
      <div className="sticky top-0 bg-background px-2 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          <NavLink to="/" className="inline-flex items-center">
            <PiHandFistBold className="mr-2 h-6 w-6 text-yellow-500" />
            kobushi
          </NavLink>
        </h1>
      </div>
      <div className="flex-1">
        <div className="grid gap-1 p-px">
          <Menus />
        </div>
      </div>
      <div className="sticky bottom-0 bg-background px-2 py-4">
        <AccountMenu />
      </div>
    </div>
  )
}
