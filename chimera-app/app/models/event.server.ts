import { Events, EventModel2Event } from '~/types/events'
import { supabase } from '~/lib/supabase-client.server'

// タスク一覧を取得
export async function getEvents(accountId: string): Promise<Events> {
  const { data, error } = await supabase
    .from('events')
    .select()
    .eq('account_id', accountId)
    .order('id')
  if (error) throw error

  const events = data.map((event) => {
    return EventModel2Event(event)
  })

  return events
}
