import * as React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnVoidFunctionType = (...args: any[]) => void

// 関数を指定した時間が経過するまでは、同じ関数の実行を抑制するフック
export function useDebounce(
  func: ReturnVoidFunctionType,
  delay: number,
): (...args: Parameters<ReturnVoidFunctionType>) => void {
  const timerId = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  return React.useCallback(
    (...args: Parameters<ReturnVoidFunctionType>) => {
      if (timerId.current) {
        clearTimeout(timerId.current)
      }
      timerId.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay],
  )
}
