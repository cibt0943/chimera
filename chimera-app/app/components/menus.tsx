import { NavLink } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { MenuList } from '~/lib/menu'

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
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  children: React.ReactNode
}

function CustomNavLink({
  to,
  className,
  onClick,
  children,
}: CustomNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) => {
        return cn(NavLinkClassName({ isActive, isPending }), className)
      }}
      onClick={(event) => {
        // NaviLinkに当たっているフォーカスを外す
        event.currentTarget.blur()
        onClick && onClick(event)
      }}
      state={{ isLoadEffect: true }}
    >
      {children}
    </NavLink>
  )
}

interface MenuProps {
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}

export function Menus({ className, onClick }: MenuProps) {
  const { t } = useTranslation()

  return (
    <>
      {MenuList.map((menu, index) => (
        <CustomNavLink
          to={menu.url}
          key={index}
          className={className}
          onClick={onClick}
        >
          <menu.icon className="mr-2 h-5 w-5" />
          {t(menu.title)}
        </CustomNavLink>
      ))}
    </>
  )
}
