import { useIsomorphicLayoutEffect } from '~/lib/hooks'
import { Theme } from '~/types/accounts'

// テーマ設定
export function useTheme(theme: Theme) {
  const isomorphicLayoutEffect = useIsomorphicLayoutEffect()
  const prefersLightMQ = '(prefers-color-scheme: dark)'

  function updateClassName() {
    const root = window.document.documentElement
    root.classList.remove(Theme.SYSTEM, Theme.LIGHT, Theme.DARK)
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
    updateClassName()
    const mediaQuery = window.matchMedia(prefersLightMQ)
    const handleChange = () => updateClassName()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
}
