import { NavLink } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { PiHandFistBold } from 'react-icons/pi'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { MenuList } from '~/lib/menu'
import { AccountMenu } from '~/components/account-menu'

interface NavLinkClassNameProps {
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

interface CustomNavLinkProps {
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
  const { t } = useTranslation()

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
          {MenuList.map((menu, index) => (
            <CustomNavLink to={menu.url} key={index}>
              <menu.icon className="mr-2 h-5 w-5" />
              {t(menu.title)}
            </CustomNavLink>
          ))}
        </div>
      </div>
      <div className="mx-2 mb-4">
        <AccountMenu />
      </div>
    </div>
  )
}
