import { NavLink } from '@remix-run/react'
import {
  RxCheck,
  RxCalendar,
  RxFile,
  RxPaperPlane,
  RxPencil2,
} from 'react-icons/rx'
import { Button } from '~/components/ui/button'
import { UserMenu } from '~/components/user-menu'

export function Sidebar() {
  return (
    <div className="px-2 py-4">
      <h1 className="mb-2 px-4 text-2xl font-bold tracking-tight">
        <NavLink to="/">kobushi</NavLink>
      </h1>
      <div className="">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <NavLink to="/todos">
            <RxCheck className="mr-2 h-4 w-4" />
            Todo
          </NavLink>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <NavLink to="/memos">
            <RxPencil2 className="mr-2 h-4 w-4" />
            Memo
          </NavLink>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <NavLink to="/events">
            <RxCalendar className="mr-2 h-4 w-4" />
            Event
          </NavLink>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <NavLink to="/files">
            <RxFile className="mr-2 h-4 w-4" />
            File
          </NavLink>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <NavLink to="/reminders">
            <RxPaperPlane className="mr-2 h-4 w-4" />
            Reminder
          </NavLink>
        </Button>
      </div>
      <div className="px-4 mt-16">
        <UserMenu />
      </div>
    </div>
  )
}
