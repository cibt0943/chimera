import { Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { RxEnter } from 'react-icons/rx'

export default function Login() {
  return (
    <div className="p-10">
      <div>この機能を利用するにはログインする必要があります。</div>
      <div className="mt-4">
        <Form action="/auth/auth0" method="post">
          <Button>
            <RxEnter className="mr-2 h-4 w-4" />
            Log in
          </Button>
        </Form>
      </div>
    </div>
  )
}
