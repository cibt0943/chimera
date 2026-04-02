import * as React from 'react'
import { isServerSide, getUserAgent, UserAgent } from '~/lib/utils'

// サーバーサイドかどうかを判定するカスタムフック
export function useIsServer() {
  const [isServer, setIsServer] = React.useState(isServerSide())

  React.useEffect(() => {
    // クライアントサイドではサーバーでないと設定
    setIsServer(false)
  }, [])

  return isServer
}

// ユーザーエージェント情報を取得するカスタムフック
export function useUserAgent() {
  const [userAgent, setUserAgent] = React.useState<UserAgent>(getUserAgent())

  React.useEffect(() => {
    // クライアントサイドでユーザーエージェント情報を設定
    setUserAgent(getUserAgent())
  }, [])

  return userAgent
}
