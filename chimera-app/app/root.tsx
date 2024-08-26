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
import { I18nextProvider, useTranslation } from 'react-i18next'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { getToast } from 'remix-toast'
import { Toaster as Sonner, toast as notify } from 'sonner'
import { Toaster } from '~/components/ui/toaster'
import styles from '~/styles/tailwind.css'
import i18n, { useChangeLanguage } from '~/lib/i18n/i18n'
import { authenticator } from '~/lib/auth.server'
import { useTheme } from './lib/hooks'
import { Theme, Language } from '~/types/accounts'
import { LoadingEffect } from '~/components/loading-effect'
import { Navbar } from '~/components/navbar'
import { Sidebar } from '~/components/sidebar'
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
    return Language.JA
  } else if (acceptLanguage?.startsWith('ja')) {
    return Language.JA
  } else {
    return Language.EN
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // セッションから認証情報を取得
  const loginSession = await authenticator.isAuthenticated(request)

  // 言語を変更
  let language = loginSession?.account.language || 'auto'
  language = language === 'auto' ? getLanguageFromHeader(request) : language
  i18n.changeLanguage(language)

  // トーストメッセージを取得
  const { toast, headers } = await getToast(request)

  return typedjson({ loginSession, language, toast }, { headers })
}

export default function App() {
  const { loginSession, language, toast } = useTypedLoaderData<typeof loader>()
  const theme = loginSession?.account.theme || Theme.SYSTEM
  const { t } = useTranslation()

  // useEffectにてOSのテーマ設定に合わせてテーマを変更
  useTheme(theme)

  // クライアントサイドでの言語設定
  useChangeLanguage(language)

  // ログインユーザーのアカウント情報をグローバルステートに保存
  const setLoginAccount = useSetAtom(loginSessionAtom)
  React.useEffect(() => {
    setLoginAccount(loginSession)
  }, [setLoginAccount, loginSession])

  // トーストメッセージを表示
  React.useEffect(() => {
    if (toast && toast.message !== '') {
      if (toast.type === 'success') {
        notify.success(t(toast.message))
      } else {
        notify.info(t(toast.message))
      }
    }
  }, [toast, t])

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
      <body className="overflow-y-hidden">
        <I18nextProvider i18n={i18n}>
          <div className="flex">
            <aside className="h-screen overflow-auto">
              <Sidebar />
            </aside>
            <div className="h-screen flex-1 overflow-auto">
              <Navbar />
              <main>
                <LoadingEffect>
                  <Outlet />
                </LoadingEffect>
              </main>
            </div>
            <Toaster />
            <Sonner closeButton />
          </div>
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
