export type Event = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  memo?: string
  location?: string
}

export type Events = Event[]
