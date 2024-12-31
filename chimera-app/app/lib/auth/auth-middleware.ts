import { redirect } from 'react-router'
import { getSession } from '~/lib/session.server'

// 認証状態を検証し、未認証の場合は/loginへリダイレクト、認証済の場合はアカウント情報を取得
export async function isAuthenticated(request: Request) {
  const session = await getSession(request.headers.get('cookie'))
  const loginInfo = session.get('loginInfo')
  if (!loginInfo) throw redirect('/login')
  return loginInfo
}
