import * as React from 'react'
import { isServerSide, UserAgent, getUserAgent } from '~/lib/utils'

// サーバーサイドかどうかを判定するカスタムフック
export function useIsServer() {
  const [isServer, setIsServer] = React.useState(isServerSide())

  React.useEffect(() => {
    // クライアントサイドではサーバーでないと設定
    setIsServer(false)
  }, [])

  return isServer
}

export function useUserAgent() {
  const [userAgent, setUserAgent] = React.useState<UserAgent>(getUserAgent())

  React.useEffect(() => {
    // クライアントサイドでOSを設定
    setUserAgent(getUserAgent())
  }, [])

  return userAgent
}
