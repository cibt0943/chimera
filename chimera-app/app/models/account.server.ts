import { toDate } from 'date-fns'
import type { Database } from '~/types/schema'
import { Account, Language, Theme } from '~/types/accounts'
import { supabase } from '~/lib/supabase-client.server'

// DBのアカウントテーブルの型
export type AccountModel = Database['public']['Tables']['accounts']['Row']
export type UpdateAccountModel =
  Database['public']['Tables']['accounts']['Update'] & { id: string } // idを必須で上書き

// idからアカウント情報を取得
export async function getAccount(accountId: string): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .eq('id', accountId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return convertToAccount(data)
}

// sub(Auth0のID)からアカウント情報を取得
export async function getAccountBySub(sub: string): Promise<Account | null> {
  const { data } = await supabase
    .from('accounts')
    .select()
    .eq('sub', sub)
    .single()

  return data ? convertToAccount(data) : null
}

// アカウント情報の取得、なければ追加
export async function getOrInsertAccount(sub: string): Promise<Account> {
  const account = await getAccountBySub(sub)
  if (account) return account

  const { data, error } = await supabase
    .from('accounts')
    .insert({ sub })
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return convertToAccount(data)
}

// アカウント情報の更新
export async function updateAccount(
  account: UpdateAccountModel,
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

  return convertToAccount(data)
}

// アカウント情報の削除
export async function deleteAccount(accountId: string): Promise<void> {
  const { error } = await supabase.from('accounts').delete().eq('id', accountId)
  if (error) throw error
}

export function convertToAccount(accountModel: AccountModel): Account {
  return {
    id: accountModel.id,
    createdAt: toDate(accountModel.created_at),
    updatedAt: toDate(accountModel.updated_at),
    sub: accountModel.sub,
    language: accountModel.language as Language,
    timezone: accountModel.timezone,
    theme: accountModel.theme as Theme,
  }
}
