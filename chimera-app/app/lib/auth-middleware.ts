import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  LoaderFunction,
  ActionFunction,
  redirect,
} from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'
import { Account } from '~/types/accounts'

// 認証状態を検証し、未認証の場合は/loginへリダイレクト、認証済の場合はアカウント情報を取得する
export async function MyAuthenticated(request: Request) {
  const account = await authenticator.isAuthenticated(request)
  if (!account) throw redirect('/login')

  return account
}

export function withAuthentication<
  T extends LoaderFunction | ActionFunction,
  U extends LoaderFunctionArgs | ActionFunctionArgs,
>(handler: (args: U & { account: Account }) => ReturnType<T>) {
  return async (args: U) => {
    const account = await MyAuthenticated(args.request)
    return handler({ ...args, account })
  }
}
