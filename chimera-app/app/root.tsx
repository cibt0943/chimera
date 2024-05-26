import * as React from 'react'
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
} from '@remix-run/react'

import styles from '~/tailwind.css'
import { authenticator } from '~/lib/auth.server'
import { themeCookie } from '~/lib/cookies.server'
import { AccountProvider } from '~/components/account-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { Sidebar } from '~/components/sidebar'
import { Toaster } from '~/components/ui/toaster'
import { useIsLoading } from '~/lib/utils'
import { I18nextProvider } from 'react-i18next'
import i18n from '~/lib/i18n/i18n'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader({ request }: LoaderFunctionArgs) {
  // クッキーからカラーモードを取得
  const cookieHeader = request.headers.get('Cookie')
  const cookie = (await themeCookie.parse(cookieHeader)) || {}

  // セッションから認証情報を取得
  const account = await authenticator.isAuthenticated(request)

  // 言語を変更
  i18n.changeLanguage(account?.language || i18n.language)

  return json({ theme: cookie.theme, account })
}

export default function App() {
  const { theme, account } = useLoaderData<typeof loader>()
  const loadingCss = useIsLoading() ? 'opacity-20' : ''

  // クライアントサイドでの言語設定
  React.useEffect(() => {
    i18n.changeLanguage(account?.language || i18n.language)
  }, [account])

  return (
    <html lang={i18n.language} className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <I18nextProvider i18n={i18n}>
          <AccountProvider account={account}>
            <ThemeProvider defaultTheme={theme}>
              <div className="flex">
                <aside className="w-48">
                  <Sidebar />
                </aside>
                <main className="grow h-screen overflow-auto">
                  <div className={loadingCss}>
                    <Outlet />
                  </div>
                </main>
                <Toaster />
              </div>
            </ThemeProvider>
          </AccountProvider>
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
