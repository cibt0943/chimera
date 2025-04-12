import { useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { FuncMenuList } from '~/components/layouts/sidebar-func-menu'

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
    <header className="bg-background sticky top-0 z-10 flex h-12 items-center gap-2 px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4!" />
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
