import { createContext, useState } from 'react'
import { useIsomorphicLayoutEffect } from '~/lib/useIsomorphicLayoutEffect'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
  theme: Theme
  upateTheme: (newTheme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  upateTheme: () => null,
}

export const ThemeContext = createContext<ThemeProviderState>(initialState)

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const isomorphicLayoutEffect = useIsomorphicLayoutEffect()
  const [theme, setTheme] = useState<Theme>('system')

  const prefersLightMQ = '(prefers-color-scheme: dark)'

  isomorphicLayoutEffect(() => {
    console.log('a')
    const savedTheme = window.localStorage.getItem('theme')
    console.log(savedTheme)
    setTheme((savedTheme || 'system') as Theme)
  }, [])

  isomorphicLayoutEffect(() => {
    console.log('b')
    console.log(theme)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia(prefersLightMQ).matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  }, [theme])

  // const mediaQueryLlistener = (e: MediaQueryListEvent) => {
  //   if (theme === 'system') {
  //     if (e.matches) {
  //       document.documentElement.classList.add('dark')
  //     } else {
  //       document.documentElement.classList.remove('dark')
  //     }
  //   }
  // }

  // window.matchMedia(prefersLightMQ).addEventListener('change', mediaQueryLlistener)

  // useEffect(() => {
  //   const mediaQuery = window.matchMedia(prefersLightMQ);
  //   const handleChange = () => {
  //     setTheme(mediaQuery.matches ? Theme.LIGHT : Theme.DARK);
  //   };
  //   mediaQuery.addEventListener('change', handleChange);
  //   return () => mediaQuery.removeEventListener('change', handleChange);
  // }, []);

  const upateTheme = (newTheme: Theme) => {
    window.localStorage.setItem('theme', newTheme)
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, upateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
