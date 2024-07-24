import {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  LoaderFunction,
  ActionFunction,
  redirect,
} from '@remix-run/node'
import { authenticator } from '~/lib/auth.server'
import { LoginSession } from '~/types/accounts'

// 認証状態を検証し、未認証の場合は/loginへリダイレクト、認証済の場合はアカウント情報を取得
export async function MyAuthenticated(request: Request) {
  const loginSession = await authenticator.isAuthenticated(request)
  if (!loginSession) throw redirect('/login')

  return loginSession
}

export function withAuthentication<
  T extends LoaderFunction | ActionFunction,
  U extends LoaderFunctionArgs | ActionFunctionArgs,
>(handler: (args: U & { loginSession: LoginSession }) => ReturnType<T>) {
  return async (args: U) => {
    const loginSession = await MyAuthenticated(args.request)
    return handler({ ...args, loginSession })
  }
}
