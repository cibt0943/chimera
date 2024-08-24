import { useNavigation } from '@remix-run/react'

export function useIsLoading() {
  const navigation = useNavigation()
  return ['loading', 'submitting'].includes(navigation.state)
}

export function useIsLoadingEffect() {
  const navigation = useNavigation()
  return useIsLoading() && navigation.location?.state?.isLoadEffect === true
}
