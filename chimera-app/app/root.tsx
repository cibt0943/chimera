import * as React from 'react'
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
import { I18nextProvider } from 'react-i18next'

import styles from '~/tailwind.css'
import { authenticator } from '~/lib/auth.server'
import { useTheme } from './lib/useTheme'
import i18n from '~/lib/i18n/i18n'
import { Theme } from '~/types/accounts'
import { LoadingEffect } from '~/components/loading-effect'
import { AccountProvider } from '~/components/account-provider'
import { Sidebar } from '~/components/sidebar'
import { Toaster } from '~/components/ui/toaster'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader({ request }: LoaderFunctionArgs) {
  // セッションから認証情報を取得
  const account = await authenticator.isAuthenticated(request)

  // 言語を変更
  let language = (account && account.language) || 'auto'
  if (language === 'auto') {
    // リクエストヘッダから言語を取得
    const cookieHeader = request.headers.get('Cookie')
    const acceptLanguage = request.headers.get('Accept-Language')
    if (cookieHeader && cookieHeader.includes('i18next=ja')) {
      language = 'ja'
    } else if (acceptLanguage && acceptLanguage.startsWith('ja')) {
      language = 'ja'
    } else {
      language = 'en'
    }
  }
  i18n.changeLanguage(language)

  return json({ account, language })
}

export default function App() {
  const { account, language } = useLoaderData<typeof loader>()
  const theme = (account?.theme || Theme.SYSTEM) as Theme
  useTheme(theme)

  // クライアントサイドでの言語設定
  React.useEffect(() => {
    i18n.changeLanguage(language)
  }, [language])

  return (
    <html lang={language} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <I18nextProvider i18n={i18n}>
          <AccountProvider account={account}>
            <div className="flex">
              <aside className="w-48">
                <Sidebar />
              </aside>
              <main className="grow h-screen overflow-auto">
                <LoadingEffect>
                  <Outlet />
                </LoadingEffect>
              </main>
              <Toaster />
            </div>
          </AccountProvider>
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
