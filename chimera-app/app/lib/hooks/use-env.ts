import * as React from 'react'

export function useIsServer() {
  const [isServer, setIsServer] = React.useState(true)

  React.useEffect(() => {
    // クライアントサイドではサーバーでないと設定
    setIsServer(false)
  }, [])

  return isServer
}
