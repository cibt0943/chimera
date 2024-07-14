import { atom } from 'jotai'
import { Account } from '~/types/accounts'

// ログインユーザーのアカウント情報を保持する
export const loginAccountAtom = atom<Account | null>(null)
