import { atom } from 'jotai'
import { LoginSession } from '~/types/accounts'

// ログインユーザーのアカウント情報を保持する
export const loginSessionAtom = atom<LoginSession | null>(null)
