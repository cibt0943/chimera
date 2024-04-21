import clsx from 'clsx'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'

import styles from '~/tailwind.css'
import { authenticator } from '~/lib/auth.server'
import { themeCookie } from '~/lib/cookies'
import { AccountProvider } from '~/components/account-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { Sidebar } from '~/components/sidebar'
import { Toaster } from '~/components/ui/toaster'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader({ request }: LoaderFunctionArgs) {
  // クッキーからカラーモードを取得
  const cookieHeader = request.headers.get('Cookie')
  const cookie = (await themeCookie.parse(cookieHeader)) || {}
  const account = await authenticator.isAuthenticated(request)
  return json({ theme: cookie.theme, account })
}

export default function App() {
  const { theme, account } = useLoaderData<typeof loader>()

  const navigation = useNavigation()
  const loadingCss = ['loading', 'submitting'].includes(navigation.state)
    ? 'opacity-20'
    : ''

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AccountProvider account={account}>
          <ThemeProvider defaultTheme={theme}>
            <div className="flex">
              <aside className="flex-none w-48">
                <div className="sticky top-0">
                  <Sidebar />
                </div>
              </aside>
              <main className="grow">
                <div className={loadingCss}>
                  <Outlet />
                </div>
              </main>
              <Toaster />
            </div>
          </ThemeProvider>
        </AccountProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
