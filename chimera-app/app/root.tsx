import clsx from 'clsx'
import { cssBundleHref } from '@remix-run/css-bundle'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
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
import { getTheme } from '~/utils/cookies'
import { ThemeProvider } from '~/components/theme-provider'
import { Sidebar } from '~/components/sidebar'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export async function loader({ request }: LoaderFunctionArgs) {
  // クッキーからカラーモードを取得
  return await getTheme(request)
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>()

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme={theme}>
          <div className="flex">
            <aside className="flex-none w-48">
              <div className="sticky top-0">
                <Sidebar />
              </div>
            </aside>
            <main className="grow py-4">
              <Outlet />
            </main>
          </div>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
