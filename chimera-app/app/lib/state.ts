import { atom, useAtom } from 'jotai'
import { LoginSession } from '~/types/accounts'
import { MemoSettings } from '~/types/memo-settings'
import { UserAgent, getUserAgent } from '~/lib/utils'

// ユーザーエージェント情報を保持する
export const userAgentAtom = atom<UserAgent>(getUserAgent())

// ログインユーザーのアカウント情報を保持する
export const loginSessionAtom = atom<LoginSession | null>(null)

// アカウントごとのメモ設定情報を保持する
export const memoSettingsAtom = atom<MemoSettings | null>(null)

export function useUserAgentAtom() {
  const [userAgent, setUserAgent] = useAtom(userAgentAtom)
  return { userAgent, setUserAgent }
}
