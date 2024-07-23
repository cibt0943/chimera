import { useRouteError } from '@remix-run/react'
import { RiAlertLine } from 'react-icons/ri'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export function ErrorView() {
  const error = useRouteError()

  const errMessage = error instanceof Error ? error.message : 'unknown error'

  return (
    <Alert variant="destructive">
      <RiAlertLine className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errMessage}</AlertDescription>
    </Alert>
  )
}
