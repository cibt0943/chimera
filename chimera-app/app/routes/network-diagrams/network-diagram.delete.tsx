// app/routes/network-diagrams/network-diagram.delete.tsx
import { redirect } from 'react-router'
import { isAuthenticated } from '~/lib/auth/auth-middleware'
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'

export async function action({
  request,
  params,
}: {
  request: Request
  params: { diagramId: string }
}) {
  const loginInfo = await isAuthenticated(request)
  const supabase = createSupabaseClientForUser(loginInfo.account.id)

  const { error } = await supabase
    .from('network_diagrams')
    .delete()
    .eq('id', params.diagramId)

  if (error) {
    throw new Response(error.message, { status: 500 })
  }

  return redirect('/network-diagrams')
}
