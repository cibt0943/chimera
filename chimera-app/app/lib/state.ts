import { atom } from 'jotai'
import { LoginSession } from '~/types/accounts'
import { MemoSettings } from '~/types/memo-settings'

// ログインユーザーのアカウント情報を保持する
export const loginSessionAtom = atom<LoginSession | null>(null)

// アカウントごとのメモ設定情報を保持する
export const memoSettingsAtom = atom<MemoSettings | null>(null)
