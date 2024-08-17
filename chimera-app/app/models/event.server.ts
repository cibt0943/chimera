import {
  Events,
  Event,
  InsertEventModel,
  UpdateEventModel,
  EventModel2Event,
} from '~/types/events'
import { supabase } from '~/lib/supabase-client.server'

// イベント一覧を取得
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

// イベントを取得
export async function getEvent(eventId: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select()
    .eq('id', eventId)
    .single()
  if (error || !data) throw error || new Error('erorr')

  return EventModel2Event(data)
}

// イベントの追加
export async function insertEvent(event: InsertEventModel): Promise<Event> {
  const { data: newEvent, error: errorNewEvent } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (errorNewEvent || !newEvent) throw errorNewEvent || new Error('erorr')

  return EventModel2Event(newEvent)
}

// イベントの更新
export async function updateEvent(
  event: UpdateEventModel,
  noUpdated = false,
): Promise<Event> {
  if (!noUpdated) event.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', event.id)
    .select()
    .single()
  if (error || !data) throw error || new Error('erorr')

  return EventModel2Event(data)
}

// イベントの削除
export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw error
}
