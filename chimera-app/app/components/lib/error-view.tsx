import { useRouteError } from '@remix-run/react'
import { LuAlertTriangle } from 'react-icons/lu'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export function ErrorView() {
  const error = useRouteError()

  const errMessage = error instanceof Error ? error.message : 'unknown error'

  return (
    <Alert variant="destructive">
      <LuAlertTriangle />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errMessage}</AlertDescription>
    </Alert>
  )
}
