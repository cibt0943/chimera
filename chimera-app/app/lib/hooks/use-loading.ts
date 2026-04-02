import { useNavigation } from 'react-router'

export function useIsLoading() {
  const navigation = useNavigation()
  return Boolean(navigation.location)
  // return ['loading', 'submitting'].includes(navigation.state)
}

export function useIsLoadingEffect() {
  const navigation = useNavigation()
  const isLoading = useIsLoading()
  return isLoading && navigation.location?.state?.isLoadEffect === true
}
