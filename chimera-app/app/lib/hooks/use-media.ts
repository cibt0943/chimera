import * as React from 'react'
import { useIsServer } from '~/lib/hooks'

function useGetInitialState(query: string, defaultState?: boolean) {
  const isServer = useIsServer()

  if (defaultState !== undefined) {
    return defaultState
  }

  return isServer ? false : window.matchMedia(query).matches
}

export function useMedia(query: string, defaultState?: boolean) {
  const [state, setState] = React.useState(
    useGetInitialState(query, defaultState),
  )

  React.useEffect(() => {
    let mounted = true
    const mediaQueryList = window.matchMedia(query)
    const onChange = () => {
      if (mounted) {
        setState(!!mediaQueryList.matches)
      }
    }

    mediaQueryList.addEventListener('change', onChange)
    setState(mediaQueryList.matches)

    return () => {
      mounted = false
      mediaQueryList.removeEventListener('change', onChange)
    }
  }, [query])

  return state
}
