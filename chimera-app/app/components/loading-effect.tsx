import { useIsLoadingEffect } from '~/lib/hooks'

export function LoadingEffect({ children }: { children: React.ReactNode }) {
  const loadingCss = useIsLoadingEffect() ? 'opacity-40' : ''
  return <div className={loadingCss}>{children}</div>
}
