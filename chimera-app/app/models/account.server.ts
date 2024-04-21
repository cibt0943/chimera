import { AccountModel } from '~/types/accounts'
import { supabase } from '~/lib/supabaseClient.server'

// idからアカウント情報を取得
export async function getAccount(account_id: number): Promise<AccountModel> {
  const { data, error } = await supabase
    .from('accounts')
    .select()
    .eq('id', account_id)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

// sub(Auth0のID)からアカウント情報を取得
export async function getAccountBySub(
  sub: string,
): Promise<AccountModel | null> {
  const { data } = await supabase
    .from('accounts')
    .select()
    .eq('sub', sub)
    .single()

  return data
}

// アカウント情報の取得、なければ追加
export async function getOrInsertAccount({
  sub,
}: {
  sub: string
}): Promise<AccountModel> {
  const account = await getAccountBySub(sub)
  if (account) return account
  const { data, error } = await supabase
    .from('accounts')
    .insert({ sub: sub })
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return data
}

// アカウント情報の削除
export async function deleteAccount(account_id: number): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', account_id)
  if (error) throw error
}
