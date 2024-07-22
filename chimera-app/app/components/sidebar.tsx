import { NavLink } from '@remix-run/react'
import { PiHandFistBold } from 'react-icons/pi'
import {
  RxCheck,
  RxCalendar,
  RxFile,
  RxPaperPlane,
  RxPencil2,
} from 'react-icons/rx'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'
import { AccountMenu } from '~/components/account-menu'

type NavLinkClassNameProps = {
  isActive: boolean
  isPending: boolean
}

function NavLinkClassName({ isActive, isPending }: NavLinkClassNameProps) {
  const className = isActive ? 'font-bold' : isPending ? 'pending' : ''
  return cn(
    buttonVariants({
      variant: isActive ? 'secondary' : 'ghost',
      className: cn('justify-start', className),
    }),
  )
}

type CustomNavLinkProps = {
  to: string
  children: React.ReactNode
}

function CustomNavLink({ to, children }: CustomNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={NavLinkClassName}
      onClick={(event) => {
        // NaviLinkに当たっているフォーカスを外す
        event.currentTarget.blur()
      }}
    >
      {children}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <div className="px-2 flex flex-col justify-between h-screen w-44">
      <div className="overflow-auto">
        <div className="bg-background sticky top-0">
          <h1 className="mx-2 my-4 text-2xl font-bold tracking-tight">
            <NavLink to="/" className="inline-flex items-center">
              <PiHandFistBold className="mr-2 text-yellow-500" />
              kobushi
            </NavLink>
          </h1>
        </div>
        <div className="grid gap-1 p-px">
          <CustomNavLink to="/todos">
            <RxCheck className="mr-2 h-5 w-5" />
            Todo
          </CustomNavLink>
          <CustomNavLink to="/memos">
            <RxPencil2 className="mr-2 h-5 w-5" />
            Memo
          </CustomNavLink>
          <CustomNavLink to="/events">
            <RxCalendar className="mr-2 h-5 w-5" />
            Event
          </CustomNavLink>
          <CustomNavLink to="/files">
            <RxFile className="mr-2 h-5 w-5" />
            File
          </CustomNavLink>
          <CustomNavLink to="/reminders">
            <RxPaperPlane className="mr-2 h-5 w-5" />
            Reminder
          </CustomNavLink>
        </div>
      </div>
      <div className="mx-2 mb-4">
        <AccountMenu />
      </div>
    </div>
  )
}
