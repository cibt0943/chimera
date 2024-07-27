export type Event = {
  id: string
  created_at: Date
  updated_at: Date
  account_id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  memo?: string
  location?: string
}

export type Events = Event[]
