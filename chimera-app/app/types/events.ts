import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'
import { Task } from '~/types/tasks'
import { Memo } from '~/types/memos'

// DBのタスクテーブルの型
export type EventModel = Database['public']['Tables']['events']['Row']

// イベントの型
export type Event = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  title: string
  start: Date
  end: Date | null
  allDay: boolean
  memo: string
  location: string
}

export type Events = Event[]

export function EventModel2Event(eventModel: EventModel): Event {
  return {
    id: eventModel.id,
    createdAt: toDate(eventModel.created_at),
    updatedAt: toDate(eventModel.updated_at),
    accountId: eventModel.account_id,
    title: eventModel.title,
    start: toDate(eventModel.start),
    end: eventModel.end ? toDate(eventModel.end) : null,
    allDay: eventModel.all_day,
    memo: eventModel.memo,
    location: eventModel.location,
  }
}

export const EventSchema = zod.object({
  title: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  start: zod.date(),
  end: zod.date().optional(),
  memo: zod.string().max(10000, '10000文字以内で入力してください').optional(),
  location: zod
    .string()
    .max(10000, '10000文字以内で入力してください')
    .optional(),
})

export type EventSchemaType = zod.infer<typeof EventSchema>

export const CalendarEventType = {
  EVENT: 0,
  TASK: 1,
  MEMO: 2,
} as const
export type CalendarEventType =
  (typeof CalendarEventType)[keyof typeof CalendarEventType]

// FullCalendarのイベントの型
export type CalendarEvent = {
  id: string
  type: CalendarEventType
  title: string
  start: Date
  end?: Date
  allDay: boolean
  className?: string
  backgroundColor: string
  borderColor: string
}

export type CalendarEvents = CalendarEvent[]

export function Event2Calendar(event: Event): CalendarEvent {
  return {
    id: event.id,
    type: CalendarEventType.EVENT,
    title: event.title,
    start: event.start,
    end: event.end || undefined,
    allDay: event.allDay,
    backgroundColor: '#BFDBFF',
    borderColor: '#BFDBFF',
  }
}

export function Task2Calendar(task: Task): CalendarEvent {
  if (!task.dueDate) {
    throw new Error('dueDate is required')
  }

  return {
    id: task.id,
    type: CalendarEventType.TASK,
    title: task.title,
    start: task.dueDate,
    end: undefined,
    allDay: false,
    backgroundColor: '#F5D0FE',
    borderColor: '#F5D0FE',
  }
}

export function Memo2Calendar(memo: Memo): CalendarEvent {
  if (!memo.relatedDate) {
    throw new Error('relatedDate is required')
  }

  return {
    id: memo.id,
    type: CalendarEventType.MEMO,
    title: memo.title,
    start: memo.relatedDate,
    end: undefined,
    allDay: false,
    backgroundColor: '#FEF08A',
    borderColor: '#FEF08A',
  }
}
