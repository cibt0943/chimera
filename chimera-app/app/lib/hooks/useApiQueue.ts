import * as React from 'react'

type ApiRequest = () => Promise<void>

// キューを使って非同期処理を順次実行するフック
export function useApiQueue() {
  // useRefで管理することで、コンポーネントの再レンダリングに影響されずに同じ値を保持できるようにしています。
  const queue = React.useRef<ApiRequest[]>([])
  const processing = React.useRef<boolean>(false)

  // キューにリクエストを追加し、処理を開始する
  const enqueue = (req: ApiRequest) => {
    queue.current.push(req)
    processQueue()
  }

  // キューから次のリクエストを取り出して実行
  async function processQueue() {
    if (processing.current) return
    if (queue.current.length === 0) return

    processing.current = true
    const currentRequest = queue.current.shift()!
    await currentRequest().catch(console.error)
    processing.current = false
    processQueue()
  }
  return { enqueue }
}
