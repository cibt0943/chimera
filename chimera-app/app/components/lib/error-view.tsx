import { useRouteError, isRouteErrorResponse } from 'react-router'
import { LuTriangleAlert } from 'react-icons/lu'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export function ErrorView() {
  const error = useRouteError()

  let errorMessage = ''
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'unknown error'
  }

  return (
    <Alert variant="destructive">
      <LuTriangleAlert />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}
