import * as React from 'react'

// 関数を指定した時間が経過するまでは、同じ関数の実行を抑制するフック
export function useDebounce<T extends unknown[]>(
  func: (...args: T) => void,
  delay: number,
): (...args: T) => void {
  const timerIdRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  return React.useCallback(
    (...args: T) => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
      timerIdRef.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay],
  )
}
