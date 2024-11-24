import { useLocation } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'

import { FuncMenuList } from '~/lib/func-menu'

function Title() {
  const { t } = useTranslation()
  const location = useLocation()

  const item = FuncMenuList.find((item) =>
    location.pathname.startsWith(item.url),
  )
  return item ? t(item.title) : ''
}

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-2 bg-background px-4 lg:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{Title()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
