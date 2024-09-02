import { useNavigation } from '@remix-run/react'

export function useIsLoading() {
  const navigation = useNavigation()
  return ['loading', 'submitting'].includes(navigation.state)
}

export function useIsLoadingEffect() {
  const navigation = useNavigation()
  const isLoading = useIsLoading()
  return isLoading && navigation.location?.state?.isLoadEffect === true
}
