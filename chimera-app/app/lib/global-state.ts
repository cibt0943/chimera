import { atom, useAtom } from 'jotai'
import { LoginSession } from '~/types/accounts'
import { MemoSettings } from '~/types/memo-settings'
import { UserAgent, getUserAgent } from '~/lib/utils'

// ユーザーエージェント情報を保持する
const userAgentAtom = atom<UserAgent>(getUserAgent())
export function useUserAgentAtom() {
  const [userAgent, setUserAgent] = useAtom(userAgentAtom)
  return { userAgent, setUserAgent }
}

// ログインユーザーのアカウント情報を保持する
const loginSessionAtom = atom<LoginSession | null>()
export function useLoginSessionAtom() {
  const [loginSession, setLoginSession] = useAtom(loginSessionAtom)
  return { loginSession, setLoginSession }
}

// アカウントごとのメモ設定情報を保持する
const memoSettingsAtom = atom<MemoSettings | null>()
export function useMemoSettingsAtom() {
  const [memoSettings, setMemoSettings] = useAtom(memoSettingsAtom)
  return { memoSettings, setMemoSettings }
}
