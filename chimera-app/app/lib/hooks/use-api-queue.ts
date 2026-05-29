import * as React from 'react'

type ApiRequest = () => Promise<void>

// キューを使って非同期処理を順次実行するフック
export function useApiQueue() {
  // useRefで管理することで、コンポーネントの再レンダリングに影響されずに同じ値を保持できるようにしています。
  const queueRef = React.useRef<ApiRequest[]>([])
  const processingRef = React.useRef<boolean>(false)

  // キューにリクエストを追加し、処理を開始する
  const enqueue = (req: ApiRequest) => {
    queueRef.current.push(req)
    processQueue()
  }

  // キューから次のリクエストを取り出して実行
  async function processQueue() {
    if (processingRef.current) return
    if (queueRef.current.length === 0) return

    processingRef.current = true
    const currentRequest = queueRef.current.shift()!
    await currentRequest().catch(console.error)
    processingRef.current = false
    processQueue()
  }
  return { enqueue }
}
