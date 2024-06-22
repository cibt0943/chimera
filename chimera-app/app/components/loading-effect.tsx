import { useIsLoading } from '~/lib/utils'

export function LoadingEffect({ children }: { children: React.ReactNode }) {
  const loadingCss = useIsLoading() ? 'opacity-40' : ''
  return <div className={loadingCss}>{children}</div>
}
