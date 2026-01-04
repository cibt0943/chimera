import { format, toDate } from 'date-fns'
import type { Database } from '~/types/schema'
import { Events, Event } from '~/types/events'
import { supabase } from '~/lib/supabase-client.server'

// DBのイベントテーブルの型
export type EventModel = Database['public']['Tables']['events']['Row']
export type InsertEventModel = Database['public']['Tables']['events']['Insert']
export type UpdateEventModel =
  Database['public']['Tables']['events']['Update'] & { id: string } // idを必須で上書き

// イベント一覧を取得
interface GetEventsOptionParams {
  startDateStart?: Date
  startDateEnd?: Date
}

export async function getEvents(
  accountId: string,
  options?: GetEventsOptionParams,
): Promise<Events> {
  const { startDateStart, startDateEnd } = options || {}

  let query = supabase
    .from('events')
    .select()
    .eq('account_id', accountId)
    .order('id')

  if (startDateStart) {
    query = query.gt('start_datetime', format(startDateStart, 'yyyy-MM-dd'))
  }

  if (startDateEnd) {
    query = query.lt('start_datetime', format(startDateEnd, 'yyyy-MM-dd'))
  }

  const { data, error } = await query
  if (error) throw error

  const events = data.map((event) => {
    return convertToEvent(event)
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

  return convertToEvent(data)
}

// イベントの追加
export async function addEvent(event: InsertEventModel): Promise<Event> {
  const { data: newEvent, error: errorNewEvent } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()
  if (errorNewEvent || !newEvent) throw errorNewEvent || new Error('erorr')

  return convertToEvent(newEvent)
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

  return convertToEvent(data)
}

// イベントの削除
export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw error
}

export function convertToEvent(eventModel: EventModel): Event {
  return {
    id: eventModel.id,
    createdAt: toDate(eventModel.created_at),
    updatedAt: toDate(eventModel.updated_at),
    accountId: eventModel.account_id,
    startDate: toDate(eventModel.start_datetime),
    endDate: eventModel.end_datetime ? toDate(eventModel.end_datetime) : null,
    allDay: eventModel.all_day,
    title: eventModel.title,
    memo: eventModel.memo,
    location: eventModel.location,
  }
}
