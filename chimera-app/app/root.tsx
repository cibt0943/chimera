import { cssBundleHref } from '@remix-run/css-bundle'
import type {
  LinksFunction,
  LoaderFunction,
  LoaderFunctionArgs,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useFetcher,
} from '@remix-run/react'
import clsx from 'clsx'

import styles from '~/tailwind.css'
import { Sidebar } from '~/components/sidebar'

import { getThemeFromCookie } from '~/lib/theme.server'
import { ThemeProvider } from '~/components/theme-provider'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  ...(cssBundleHref ? [{ rel: 'stylesheet', href: cssBundleHref }] : []),
]

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const theme = await getThemeFromCookie(request)
  return json({
    theme,
  })
}

export default function App() {
  const { theme = 'system' } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const onThemeChange = (theme: string) => {
    fetcher.submit(
      { theme },
      {
        method: 'post',
        encType: 'application/json',
        action: '/api/toggleTheme',
      },
    )
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme={theme} onThemeChange={onThemeChange}>
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
