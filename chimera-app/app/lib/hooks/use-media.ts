import * as React from 'react'
import { isBrowser } from '~/lib/utils'

function getInitialState(query: string, defaultState?: boolean) {
  if (defaultState !== undefined) {
    return defaultState
  }

  return isBrowser ? window.matchMedia(query).matches : false
}

export function useMedia(query: string, defaultState?: boolean) {
  const [state, setState] = React.useState(getInitialState(query, defaultState))

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
