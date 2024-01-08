import { createContext, useState, useContext } from 'react'
import { useIsomorphicLayoutEffect } from '~/lib/useIsomorphicLayoutEffect'
import { useFetcher } from '@remix-run/react'

export enum Theme {
  SYSTEM = 'system',
  DARK = 'dark',
  LIGHT = 'light',
}

type ThemeContextState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeContextState = {
  theme: Theme.SYSTEM,
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeContextState>(initialState)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme: Theme
}

export function ThemeProvider({
  children,
  defaultTheme = Theme.SYSTEM,
}: ThemeProviderProps) {
  const isomorphicLayoutEffect = useIsomorphicLayoutEffect()
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const prefersLightMQ = '(prefers-color-scheme: dark)'
  const fetcher = useFetcher()

  const updateClassName = () => {
    const root = window.document.documentElement
    root.classList.remove(Theme.LIGHT, Theme.DARK)
    if (theme === Theme.SYSTEM) {
      const systemTheme = window.matchMedia(prefersLightMQ).matches
        ? Theme.DARK
        : Theme.LIGHT
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  }

  // OSのモード変更に対するイベント付与
  isomorphicLayoutEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ)
    const handleChange = () => {
      updateClassName()
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // サービスのモード変更に対する処理
  isomorphicLayoutEffect(() => {
    // クッキーの値を更新
    fetcher.submit(
      { theme },
      {
        method: 'post',
        encType: 'application/json',
        action: '/action/set-theme',
      },
    )
  }, [theme])

  isomorphicLayoutEffect(() => {
    updateClassName()
  })

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
