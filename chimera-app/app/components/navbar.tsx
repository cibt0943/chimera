import * as React from 'react'
import { NavLink, useLocation } from '@remix-run/react'
import { PiHandFistBold } from 'react-icons/pi'
import { RiMenuLine } from 'react-icons/ri'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetContent,
} from '~/components/ui/sheet'
import {
  ACCOUNT_URL,
  TODO_URL,
  MEMO_URL,
  EVENT_URL,
  DAILY_NOTE_URL,
  FILE_URL,
  REMINDER_URL,
} from '~/constants'
import { Menus } from '~/components/menus'
import { AccountMenu } from '~/components/account-menu'

function Title() {
  const { t } = useTranslation()
  const location = useLocation()

  const funcUrl = '/' + location.pathname.split('/')[1]
  switch (funcUrl) {
    case ACCOUNT_URL:
      return t('account.page_title')
    case TODO_URL:
      return t('todo.page_title')
    case MEMO_URL:
      return t('memo.page_title')
    case EVENT_URL:
      return t('event.page_title')
    case DAILY_NOTE_URL:
      return t('daily_note.page_title')
    case FILE_URL:
      return t('file.page_title')
    case REMINDER_URL:
      return t('reminder.page_title')
    default:
      return ''
  }
}

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  function handleLinkClick() {
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-10 bg-background xl:hidden">
      <div className="flex items-center space-x-2 px-4 py-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <RiMenuLine className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side={'left'}
            className="w-[260px]"
            aria-describedby={undefined}
          >
            <SheetHeader>
              <SheetTitle className="px-4 pb-2">
                <NavLink to="/" className="flex items-center">
                  <PiHandFistBold className="mr-2 h-5 w-5 text-yellow-500" />
                  kobushi
                </NavLink>
              </SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              <div className="flex-1">
                <div className="grid gap-1 p-px">
                  <Menus onClick={handleLinkClick} />
                </div>
              </div>
              <div className="sticky bottom-0 bg-background p-4">
                <AccountMenu onSelect={handleLinkClick} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h1 className="font-bold">
          <Title />
        </h1>
      </div>
    </header>
  )
}
