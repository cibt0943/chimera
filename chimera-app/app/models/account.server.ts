import {
  Account,
  Language,
  Theme,
  AccountModel2Account,
} from '~/types/accounts'
import { supabase } from '~/lib/supabase-client.server'

// idからアカウント情報を取得
export async function getAccount(accountId: string): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .eq('id', accountId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return AccountModel2Account(data)
}

// sub(Auth0のID)からアカウント情報を取得
export async function getAccountBySub(sub: string): Promise<Account | null> {
  const { data } = await supabase
    .from('accounts')
    .select()
    .eq('sub', sub)
    .single()

  return data ? AccountModel2Account(data) : null
}

// アカウント情報の取得、なければ追加
export async function getOrInsertAccount({
  sub,
}: {
  sub: string
}): Promise<Account> {
  const account = await getAccountBySub(sub)
  if (account) return account

  const { data, error } = await supabase
    .from('accounts')
    .insert({ sub })
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return AccountModel2Account(data)
}

// アカウント情報の更新
interface updateAccountProps {
  id: string
  updated_at?: string
  language: Language
  timezone: string
  theme: Theme
}

export async function updateAccount(
  account: updateAccountProps,
  noUpdated = false,
): Promise<Account> {
  if (!noUpdated) account.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('accounts')
    .update(account)
    .eq('id', account.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return AccountModel2Account(data)
}

// アカウント情報の削除
export async function deleteAccount(accountId: string): Promise<void> {
  const { error } = await supabase.from('accounts').delete().eq('id', accountId)
  if (error) throw error
}
