import { Form } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { RxEnter } from 'react-icons/rx'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const { t } = useTranslation()

  return (
    <div className="p-10">
      <div>{t('account.message.need-login')}</div>
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
