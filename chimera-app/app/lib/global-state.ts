import * as React from 'react'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { LoginSession } from '~/types/accounts'
import { MemoSettings } from '~/types/memo-settings'
import { UserAgent, getUserAgent } from '~/lib/utils'

// ユーザーエージェント情報を保持する
const userAgentAtom = atom<UserAgent>(getUserAgent())

export function useUserAgentAtom() {
  return useAtomValue(userAgentAtom)
}

export function useSetUserAgentAtom() {
  const setUserAgent = useSetAtom(userAgentAtom)
  React.useEffect(() => {
    // クライアントサイドでユーザーエージェント情報を設定
    setUserAgent(getUserAgent())
  }, [setUserAgent])
}

// ログインユーザーのアカウント情報を保持する
const loginSessionAtom = atom<LoginSession | null>(null)

export function useLoginSessionAtom() {
  return useAtomValue(loginSessionAtom)
}

export function useSetLoginSessionAtom(loginSession: LoginSession | null) {
  const setLoginSession = useSetAtom(loginSessionAtom)
  React.useEffect(() => {
    // クライアントサイドでユーザーエージェント情報を設定
    setLoginSession(loginSession)
  }, [setLoginSession, loginSession])
}

// アカウントごとのメモ設定情報を保持する
const memoSettingsAtom = atom<MemoSettings | null>(null)

export function useMemoSettingsAtom() {
  return useAtomValue(memoSettingsAtom)
}

export function useSetMemoSettingsAtom(memoSettings: MemoSettings | null) {
  const setMemoSettings = useSetAtom(memoSettingsAtom)
  React.useEffect(() => {
    setMemoSettings(memoSettings)
  }, [setMemoSettings, memoSettings])
}
