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

import { MenuList } from '~/lib/menu'

function Title() {
  const { t } = useTranslation()
  const location = useLocation()

  const item = MenuList.find((item) => location.pathname.startsWith(item.url))
  return item ? t(item.title) : ''
}

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-2 bg-background px-4 md:hidden">
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

    // <header className="sticky top-0 z-10 bg-background xl:hidden">
    //   <div className="flex items-center space-x-2 px-4 py-2">
    //     <Sheet open={open} onOpenChange={setOpen}>
    //       <SheetTrigger asChild>
    //         <Button variant="ghost" size="icon">
    //           <RiMenuLine className="h-4 w-4" />
    //         </Button>
    //       </SheetTrigger>
    //       <SheetContent
    //         side={'left'}
    //         className="w-[260px]"
    //         aria-describedby={undefined}
    //       >
    //         <SheetHeader>
    //           <SheetTitle className="px-4 pb-2">
    //             <NavLink to="/" className="flex items-center">
    //               <PiHandFistBold className="mr-2 h-5 w-5 text-yellow-500" />
    //               kobushi
    //             </NavLink>
    //           </SheetTitle>
    //         </SheetHeader>
    //         <div className="flex h-full flex-col">
    //           <div className="flex-1">
    //             <div className="grid gap-1 p-px">
    //               <Menus onClick={handleLinkClick} />
    //             </div>
    //           </div>
    //           <div className="sticky bottom-0 bg-background p-4">
    //             <AccountMenu onSelect={handleLinkClick} />
    //           </div>
    //         </div>
    //       </SheetContent>
    //     </Sheet>
    //     <h1 className="font-bold">
    //       <Title />
    //     </h1>
    //   </div>
    // </header>
  )
}
