// app/models/network-diagram.server.ts
import { toDate } from 'date-fns'
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'
import type { Database } from '~/types/database'
import type { NetworkDiagrams, NetworkDiagram } from '~/types/network-diagrams'

export type NetworkDiagramModel =
  Database['public']['Tables']['network_diagrams']['Row']

export type InsertNetworkDiagramModel =
  Database['public']['Tables']['network_diagrams']['Insert']
export type UpdateNetworkDiagramModel =
  Database['public']['Tables']['network_diagrams']['Update'] & {
    id: string
    account_id: string
  } // idとaccount_idを必須で上書き

export async function getNetworkDiagrams(
  accountId: string,
): Promise<NetworkDiagrams> {
  const supabase = createSupabaseClientForUser(accountId)
  const { data, error } = await supabase
    .from('network_diagrams')
    .select()
    .order('updated_at', { ascending: false })

  if (error) throw new Response(error.message, { status: 500 })
  return (data ?? []).map(convertToNetworkDiagram)
}

export async function getNetworkDiagram(
  accountId: string,
  id: string,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(accountId)
  const { data, error } = await supabase
    .from('network_diagrams')
    .select()
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Response(error.message, { status: 500 })
  if (!data) throw new Response('Not Found', { status: 404 })
  return convertToNetworkDiagram(data)
}

export async function addNetworkDiagram(
  networkDiagram: InsertNetworkDiagramModel,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(networkDiagram.account_id)
  const { data, error } = await supabase
    .from('network_diagrams')
    .insert({ ...networkDiagram })
    .select('id')
    .single()

  if (error) throw new Response(error.message, { status: 500 })
  if (!data) throw new Response('Not Found', { status: 404 })

  return getNetworkDiagram(networkDiagram.account_id, data.id)
}

export async function updateNetworkDiagramTitle(
  networkDiagram: UpdateNetworkDiagramModel,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(networkDiagram.account_id)
  const { data, error } = await supabase
    .from('network_diagrams')
    .update({ ...networkDiagram })
    .eq('id', networkDiagram.id)
    .select('id')
    .single()

  if (error) throw new Response(error.message, { status: 500 })
  if (!data) throw new Response('Not Found', { status: 404 })

  return getNetworkDiagram(networkDiagram.account_id, data.id)
}

export async function deleteNetworkDiagram(
  accountId: string,
  networkDiagramId: string,
): Promise<void> {
  const supabase = createSupabaseClientForUser(accountId)
  const { error } = await supabase
    .from('network_diagrams')
    .delete()
    .eq('id', networkDiagramId)

  if (error) throw new Response(error.message, { status: 500 })
}

// MemoモデルをMemo型に変換
function convertToNetworkDiagram(
  networkDiagramModel: NetworkDiagramModel,
): NetworkDiagram {
  return {
    id: networkDiagramModel.id,
    createdAt: toDate(networkDiagramModel.created_at),
    updatedAt: toDate(networkDiagramModel.updated_at),
    accountId: networkDiagramModel.account_id,
    title: networkDiagramModel.title,
    nodes: networkDiagramModel.nodes,
    edges: networkDiagramModel.edges,
  }
}
