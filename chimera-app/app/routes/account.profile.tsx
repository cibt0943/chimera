import type { MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { useLoaderData, Form, useFetcher } from '@remix-run/react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select'

import { Button } from '~/components/ui/button'
import { withAuthentication } from '~/lib/auth-middleware'
import { Account } from '~/types/accounts'
import { getAccountBySub, updateAccount } from '~/models/account.server'
import { useTranslation } from 'react-i18next'
import { authenticator } from '~/lib/auth.server'
import { getSession, commitSession } from '~/lib/session.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Profile | Kobushi' }]
}

export const action = withAuthentication(async ({ request, account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }

  const formData = await request.formData()
  const language = formData.get('language')?.toString()
  if (!language) {
    throw new Error('Error: Invalid language.')
  }
  accountModel.language = language

  // DBのユーザー情報を更新
  await updateAccount(accountModel)

  // セッション情報を更新
  const session = await getSession(request.headers.get('cookie'))
  session.set(authenticator.sessionKey, {
    ...self,
    language,
  })

  return redirect('/account/profile', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
})

export const loader = withAuthentication(async ({ account: self }) => {
  const accountModel = await getAccountBySub(self.sub)
  if (!accountModel) {
    throw new Error('Error: Account not found.')
  }
  return json({ self })
})

type LoaderData = {
  self: Account
}

export default function Profile() {
  const { self } = useLoaderData<LoaderData>()
  const { i18n } = useTranslation()
  const fetcher = useFetcher()

  const handleLanguageChange = (value: string) => {
    // 言語を更新
    fetcher.submit({ language: value }, { method: 'post' })
  }

  return (
    <div>
      <ul>
        <li>id: {self.sub}</li>
        <li>name: {self.name}</li>
        <li>email: {self.email}</li>
      </ul>
      <div>
        <Select
          onValueChange={handleLanguageChange}
          // defaultValue={self.language}
          defaultValue={i18n.language}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-8">
        <Form action={`/account/delete`} method="delete">
          <Button type="submit" variant="destructive">
            アカウントを削除する
          </Button>
        </Form>
      </div>
    </div>
  )
}
