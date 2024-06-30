import clsx from 'clsx'
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

export function Sidebar() {
  const navLinkClassName = ({ isActive, isPending }: NavLinkClassNameProps) => {
    const className = isActive ? 'font-bold' : isPending ? 'pending' : ''
    return cn(
      buttonVariants({
        variant: isActive ? 'secondary' : 'ghost',
        className: clsx('justify-start', className),
      }),
    )
  }

  return (
    <div className="px-2 flex flex-col justify-between h-screen">
      <div className="overflow-auto">
        <div className="bg-background sticky top-0">
          <h1 className="p-4 text-2xl font-bold tracking-tight">
            <NavLink to="/" className="inline-flex items-center">
              kobushi
              <PiHandFistBold className="ml-2" />
            </NavLink>
          </h1>
        </div>
        <div className="grid gap-1 p-px">
          <NavLink to="/todos" className={navLinkClassName} reloadDocument>
            <RxCheck className="mr-2 h-5 w-5" />
            Todo
          </NavLink>
          <NavLink to="/memos" className={navLinkClassName} reloadDocument>
            <RxPencil2 className="mr-2 h-5 w-5" />
            Memo
          </NavLink>
          <NavLink to="/events" className={navLinkClassName} reloadDocument>
            <RxCalendar className="mr-2 h-5 w-5" />
            Event
          </NavLink>
          <NavLink to="/files" className={navLinkClassName} reloadDocument>
            <RxFile className="mr-2 h-5 w-5" />
            File
          </NavLink>
          <NavLink to="/reminders" className={navLinkClassName} reloadDocument>
            <RxPaperPlane className="mr-2 h-5 w-5" />
            Reminder
          </NavLink>
        </div>
      </div>
      <div className="px-px mb-4">
        <AccountMenu />
      </div>
    </div>
  )
}
