// app/models/network-diagram.server.ts
import { createSupabaseClientForUser } from '~/lib/supabase-client.server'
import type { NetworkDiagram } from '~/types/network-diagrams'

function mapRow(row: {
  id: string
  account_id: string
  title: string
  nodes: unknown[]
  edges: unknown[]
  created_at: string
  updated_at: string
}): NetworkDiagram {
  return {
    id: row.id,
    accountId: row.account_id,
    title: row.title,
    nodes: row.nodes,
    edges: row.edges,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const COLUMNS = 'id, account_id, title, nodes, edges, created_at, updated_at'

export async function getNetworkDiagrams(
  accountId: string,
): Promise<NetworkDiagram[]> {
  const supabase = createSupabaseClientForUser(accountId)
  const { data, error } = await supabase
    .from('network_diagrams')
    .select(COLUMNS)
    .order('updated_at', { ascending: false })

  if (error) throw new Response(error.message, { status: 500 })
  return (data ?? []).map(mapRow)
}

export async function getNetworkDiagram(
  accountId: string,
  id: string,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(accountId)
  const { data, error } = await supabase
    .from('network_diagrams')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Response(error.message, { status: 500 })
  if (!data) throw new Response('Not Found', { status: 404 })
  return mapRow(data)
}

export async function createNetworkDiagram(
  accountId: string,
  title: string,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(accountId)
  const { data, error } = await supabase
    .from('network_diagrams')
    .insert({ account_id: accountId, title })
    .select(COLUMNS)
    .single()

  if (error) throw new Response(error.message, { status: 500 })
  return mapRow(data)
}

export interface UpdateNetworkDiagramTitleModel {
  id: string
  account_id: string
  title: string
}

export async function updateNetworkDiagramTitle(
  values: UpdateNetworkDiagramTitleModel,
): Promise<NetworkDiagram> {
  const supabase = createSupabaseClientForUser(values.account_id)
  const { data, error } = await supabase
    .from('network_diagrams')
    .update({ title: values.title, updated_at: new Date().toISOString() })
    .eq('id', values.id)
    .select(COLUMNS)
    .single()

  if (error) throw new Response(error.message, { status: 500 })
  return mapRow(data)
}

export async function deleteNetworkDiagram(
  accountId: string,
  id: string,
): Promise<void> {
  const supabase = createSupabaseClientForUser(accountId)
  const { error } = await supabase
    .from('network_diagrams')
    .delete()
    .eq('id', id)

  if (error) throw new Response(error.message, { status: 500 })
}
