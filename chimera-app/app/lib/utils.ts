import * as React from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

type ReturnVoidFunctionType = (...args: any[]) => void
type ReturnPromiseVoidFunctionType = (...args: any[]) => Promise<void>

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(waitMsec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitMsec))
}

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

// キューを使って非同期処理を順次実行するフック
export function useQueue() {
  const queue = React.useRef<ReturnPromiseVoidFunctionType[]>([])
  const processing = React.useRef<boolean>(false)

  // キューにリクエストを追加し、処理を開始する
  const enqueue = (func: ReturnPromiseVoidFunctionType) => {
    queue.current.push(func)
    processNext()
  }

  // キューから次のリクエストを取り出して実行
  const processNext = async () => {
    if (processing.current) return
    if (queue.current.length === 0) return

    processing.current = true
    const nextFunc = queue.current.shift()!
    await nextFunc().catch(console.error)
    processing.current = false
    processNext()
  }

  return { enqueue }
}
