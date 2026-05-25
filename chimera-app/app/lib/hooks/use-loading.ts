import { useNavigation } from 'react-router'

export function useIsLoading() {
  const navigation = useNavigation()
  return Boolean(navigation.location)
}

export function useIsLoadingEffect() {
  const navigation = useNavigation()
  const isLoading = useIsLoading()
  return isLoading && navigation.location?.state?.isLoadEffect === true
}
