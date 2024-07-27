import { toDate } from 'date-fns'
import { Events } from '~/types/events'
import { supabase } from '~/lib/supabase-client.server'

// タスク一覧を取得
export async function getEvents(account_id: string): Promise<Events> {
  // const { data, error } = await supabase
  //   .from('tasks')
  //   .select()
  //   .eq('account_id', account_id)
  //   .order('position', { ascending: false })
  //   .order('id')
  // if (error) throw error

  // const events = data.map((event) => {
  //   return EventModel2Event(event)
  // })

  const events = [
    {
      id: 'a',
      created_at: new Date(),
      updated_at: new Date(),
      account_id: account_id,
      title: 'my event',
      start: toDate('2024-07-29'),
      end: toDate('2024-07-29'),
      allDay: true,
    },
  ]

  return events
}
