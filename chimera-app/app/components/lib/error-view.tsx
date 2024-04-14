import { useRouteError } from '@remix-run/react'
import { RxExclamationTriangle } from 'react-icons/rx'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export function ErrorView() {
  const error = useRouteError()

  const errMessage = error instanceof Error ? error.message : 'unknown error'

  return (
    <Alert variant="destructive">
      <RxExclamationTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errMessage}</AlertDescription>
    </Alert>
  )
}
