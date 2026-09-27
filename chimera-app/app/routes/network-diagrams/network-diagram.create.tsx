// app/routes/network-diagrams/network-diagram.create.tsx
import { redirect } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'

export async function action({ request }: { request: Request }) {
  const loginInfo = await isAuthenticated(request)
  const supabase = createSupabaseClientForUser(loginInfo.account.id)

  const { data, error } = await supabase
    .from('network_diagrams')
    .insert({ account_id: loginInfo.account.id, title: '無題のネットワーク図' })
    .select('id')
    .single()

  if (error) {
    throw new Response(error.message, { status: 500 })
  }

  return redirect(`/network-diagrams/${data.id}`)
}
