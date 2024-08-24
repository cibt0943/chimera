import * as React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnPromiseVoidFunctionType = (...args: any[]) => Promise<void>

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
