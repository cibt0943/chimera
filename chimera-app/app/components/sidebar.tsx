import { NavLink } from '@remix-run/react'
import { PiHandFistBold } from 'react-icons/pi'
import {
  RxCheckCircled,
  RxPencil2,
  RxCalendar,
  RxFile,
  RxPaperPlane,
} from 'react-icons/rx'
import { buttonVariants } from '~/components/ui/button'
import { TODO_URL, MEMO_URL, EVENT_URL } from '~/constants'
import { cn } from '~/lib/utils'
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
      state={{ isLoadEffect: true }}
    >
      {children}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <div className="flex h-screen w-44 flex-col justify-between px-2">
      <div className="overflow-auto">
        <div className="sticky top-0 bg-background">
          <h1 className="mx-2 my-4 text-2xl font-bold tracking-tight">
            <NavLink to="/" className="inline-flex items-center">
              <PiHandFistBold className="mr-2 text-yellow-500" />
              kobushi
            </NavLink>
          </h1>
        </div>
        <div className="grid gap-1 p-px">
          <CustomNavLink to={TODO_URL}>
            <RxCheckCircled className="mr-2 h-5 w-5" />
            Todo
          </CustomNavLink>
          <CustomNavLink to={MEMO_URL}>
            <RxPencil2 className="mr-2 h-5 w-5" />
            Memo
          </CustomNavLink>
          <CustomNavLink to={EVENT_URL}>
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
