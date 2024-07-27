import * as React from 'react'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { I18nextProvider } from 'react-i18next'
import styles from '~/styles/tailwind.css'
import { authenticator } from '~/lib/auth.server'
import { useTheme } from './lib/useTheme'
import i18n, { useChangeLanguage } from '~/lib/i18n/i18n'
import { Theme } from '~/types/accounts'
import { LoadingEffect } from '~/components/loading-effect'
import { Sidebar } from '~/components/sidebar'
import { Toaster } from '~/components/ui/toaster'
import { useSetAtom } from 'jotai'
import { loginSessionAtom } from '~/lib/state'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

function getLanguageFromHeader(request: Request) {
  // リクエストヘッダから言語を取得
  const cookieHeader = request.headers.get('Cookie')
  const acceptLanguage = request.headers.get('Accept-Language')
  if (cookieHeader?.includes('i18next=ja')) {
    return 'ja'
  } else if (acceptLanguage?.startsWith('ja')) {
    return 'ja'
  } else {
    return 'en'
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // セッションから認証情報を取得
  const loginSession = await authenticator.isAuthenticated(request)

  // 言語を変更
  let language = loginSession?.account.language || 'auto'
  language = language === 'auto' ? getLanguageFromHeader(request) : language
  i18n.changeLanguage(language)

  return typedjson({ loginSession, language })
}

export default function App() {
  const { loginSession, language } = useTypedLoaderData<typeof loader>()
  const theme = loginSession?.account.theme || Theme.SYSTEM

  // useEffectにてOSのテーマ設定に合わせてテーマを変更
  useTheme(theme)
  // クライアントサイドでの言語設定
  useChangeLanguage(language)
  // ログインユーザーのアカウント情報をグローバルステートに保存
  const setLoginAccount = useSetAtom(loginSessionAtom)
  React.useEffect(() => {
    setLoginAccount(loginSession)
  }, [setLoginAccount, loginSession])

  return (
    <html lang={language} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* FullCalendarにてエラーが出ないようにする対応 */}
        {/* https://fullcalendar.io/docs/react */}
        {/* https://github.com/fullcalendar/fullcalendar-examples/tree/main/remix */}
        <style data-fullcalendar />
        <Links />
      </head>
      <body>
        <I18nextProvider i18n={i18n}>
          <div className="flex">
            <aside className="">
              <Sidebar />
            </aside>
            <main className="grow h-screen overflow-auto">
              <LoadingEffect>
                <Outlet />
              </LoadingEffect>
            </main>
            <Toaster />
          </div>
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
