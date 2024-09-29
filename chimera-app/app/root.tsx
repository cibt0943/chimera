import * as React from 'react'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { I18nextProvider } from 'react-i18next'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { getToast } from 'remix-toast'
import { Toaster } from '~/components/ui/toaster'
import styles from '~/styles/tailwind.css?url'
import i18n, { useLanguage } from '~/lib/i18n/i18n'
import { authenticator } from '~/lib/auth.server'
import { getUserAgent } from '~/lib/utils'
import { useTheme, useSonner, Sonner } from './lib/hooks'
import { Theme, Language } from '~/types/accounts'
import { getOrInsertMemoSettings } from '~/models/memo-settings.server'
import { LoadingEffect } from '~/components/loading-effect'
import { Navbar } from '~/components/navbar'
import { Sidebar } from '~/components/sidebar'
import {
  useUserAgentAtom,
  useLoginSessionAtom,
  useMemoSettingsAtom,
} from '~/lib/global-state'

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: styles }]

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

  // 言語を設定
  let language = loginSession?.account.language || 'auto'
  language = language === 'auto' ? getLanguageFromHeader(request) : language
  i18n.changeLanguage(language)

  // メモ設定を取得
  const memoSettings =
    loginSession && (await getOrInsertMemoSettings(loginSession.account.id))

  // トーストメッセージを取得
  const { toast, headers } = await getToast(request)

  return typedjson({ loginSession, language, memoSettings, toast }, { headers })
}

export default function App() {
  const { loginSession, language, memoSettings, toast } =
    useTypedLoaderData<typeof loader>()
  const theme = loginSession?.account.theme || Theme.SYSTEM

  // useEffectにてOSのテーマ設定に合わせてテーマを変更
  useTheme(theme)

  // クライアントサイドでの言語設定
  useLanguage(language)

  // トーストメッセージを表示
  useSonner(toast)

  // ユーザーエージェント情報をグローバルステートに保存
  const { setUserAgent } = useUserAgentAtom()
  React.useEffect(() => {
    setUserAgent(getUserAgent())
  }, [setUserAgent])

  // ログインユーザーのアカウント情報をグローバルステートに保存
  const { setLoginSession } = useLoginSessionAtom()
  React.useEffect(() => {
    setLoginSession(loginSession)
  }, [setLoginSession, loginSession])

  // ログインユーザーのメモ設定情報をグローバルステートに保存
  const { setMemoSettings } = useMemoSettingsAtom()
  React.useEffect(() => {
    setMemoSettings(memoSettings)
  }, [setMemoSettings, memoSettings])

  return (
    <html lang={language} className="" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {/* FullCalendarにてエラーが出ないようにする対応 */}
        {/* https://fullcalendar.io/docs/react */}
        {/* https://github.com/fullcalendar/fullcalendar-examples/tree/main/remix */}
        <style data-fullcalendar />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              var theme = "${theme}";
              if (theme === "system") {
                theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              }
              const root = document.documentElement
              root.classList.add(theme);
            })();
          `,
          }}
        />
      </head>
      <body className="overflow-y-hidden">
        <I18nextProvider i18n={i18n}>
          <div className="flex">
            <aside className="h-dvh overflow-auto">
              <Sidebar />
            </aside>
            <div className="h-dvh flex-1 overflow-auto">
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
      </body>
    </html>
  )
}
