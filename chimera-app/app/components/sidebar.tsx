import clsx from 'clsx'
import { NavLink } from '@remix-run/react'
import {
  RxCheck,
  RxCalendar,
  RxFile,
  RxPaperPlane,
  RxPencil2,
} from 'react-icons/rx'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/button'
import { UserMenu } from '~/components/user-menu'

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
        className: clsx('w-full justify-start', className),
      }),
    )
  }

  return (
    <div className="px-2 py-4">
      <h1 className="mb-2 px-4 text-2xl font-bold tracking-tight">
        <NavLink to="/">kobushi</NavLink>
      </h1>
      <div className="">
        <NavLink to="/todos" className={navLinkClassName}>
          <RxCheck className="mr-2 h-4 w-4" />
          Todo
        </NavLink>
        <NavLink to="/memos" className={navLinkClassName}>
          <RxPencil2 className="mr-2 h-4 w-4" />
          Memo
        </NavLink>
        <NavLink to="/events" className={navLinkClassName}>
          <RxCalendar className="mr-2 h-4 w-4" />
          Event
        </NavLink>
        <NavLink to="/files" className={navLinkClassName}>
          <RxFile className="mr-2 h-4 w-4" />
          File
        </NavLink>
        <NavLink to="/reminders" className={navLinkClassName}>
          <RxPaperPlane className="mr-2 h-4 w-4" />
          Reminder
        </NavLink>
      </div>
      <div className="px-4 mt-16">
        <UserMenu />
      </div>
    </div>
  )
}
