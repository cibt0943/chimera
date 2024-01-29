import { UserModel } from '~/types/users'
import { supabase } from '~/lib/supabaseClient.server'

// ユーザー情報を取得
export async function getUser(sub: string): Promise<UserModel | null> {
  const { data } = await supabase.from('users').select().eq('sub', sub).single()
  return data
}

// ユーザー情報の取得、なければ追加
export async function getOrInsertUser({
  sub,
}: {
  sub: string
}): Promise<UserModel> {
  const user = await getUser(sub)
  if (user) return user

  const { data } = await supabase
    .from('users')
    .insert({ sub: sub })
    .select('*')
    .single()

  if (!data) throw new Error('erorr')

  return data
}
