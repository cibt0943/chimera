import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
} from 'react-router'
import { I18nextProvider } from 'react-i18next'
import { getToast } from 'remix-toast'
import styles from '~/styles/tailwind.css?url'
import i18n, { useLanguage } from '~/lib/i18n/i18n'
import { useTheme, useSonner } from '~/lib/hooks'
import { getSession } from '~/lib/session.server'
import { getOrAddMemoSettings } from '~/models/memo-settings.server'
import {
  useSetUserAgentAtom,
  useSetLoginInfoAtom,
  useSetMemoSettingsAtom,
} from '~/lib/global-state'
import { getUserAgent } from '~/lib/utils'
import type { Route } from './+types/root'
import { Theme, Language } from '~/types/accounts'

export function links() {
  return [{ rel: 'stylesheet', href: styles }]
}

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

export async function loader({ request }: Route.LoaderArgs) {
  // セッションから認証情報を取得
  const session = await getSession(request.headers.get('cookie'))
  const loginInfo = session.get('loginInfo')

  // 言語を設定
  let language = loginInfo?.account.language || 'auto'
  language = language === 'auto' ? getLanguageFromHeader(request) : language
  i18n.changeLanguage(language)

  // メモ設定を取得
  const memoSettings =
    loginInfo && (await getOrAddMemoSettings(loginInfo.account.id))

  // トーストメッセージを取得
  const { toast, headers } = await getToast(request)

  return data({ loginInfo, language, memoSettings, toast }, { headers })
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { loginInfo, language, memoSettings, toast } = loaderData
  const theme = loginInfo?.account.theme || Theme.SYSTEM

  // useEffectにてOSのテーマ設定に合わせてテーマを変更
  useTheme(theme)

  // クライアントサイドでの言語設定
  useLanguage(language)

  // トーストメッセージを表示
  useSonner(toast)

  // ユーザーエージェント情報をグローバルステートに保存
  useSetUserAgentAtom(getUserAgent())

  // ログインユーザーのアカウント情報をグローバルステートに保存
  useSetLoginInfoAtom(loginInfo)

  // ログインユーザーのメモ設定情報をグローバルステートに保存
  useSetMemoSettingsAtom(memoSettings)

  return (
    <html lang={language} suppressHydrationWarning={true}>
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
      <body>
        <I18nextProvider i18n={i18n}>
          <Outlet />
        </I18nextProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
