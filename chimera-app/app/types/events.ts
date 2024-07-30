import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'
import { Task } from '~/types/tasks'
import { Memo } from '~/types/memos'

// DBのイベントテーブルの型
export type EventModel = Database['public']['Tables']['events']['Row']
export type InsertEventModel = Database['public']['Tables']['events']['Insert']
type _UpdateEventModel = Database['public']['Tables']['events']['Update']
export type UpdateEventModel = Required<Pick<_UpdateEventModel, 'id'>> &
  Partial<Omit<_UpdateEventModel, 'id'>> // idを取り除いて必須で追加

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
  start: zod.date({ required_error: '必須項目です' }),
  end: zod.date().optional(),
  allDay: zod.boolean().optional(),
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
  title: string
  start: Date
  end?: Date
  allDay: boolean
  className?: string
  backgroundColor: string
  borderColor: string
  // 下記はFullCalendarには無い独自追加のプロパティ
  type: CalendarEventType
  srcObj: Event | Task | Memo
}

export type CalendarEvents = CalendarEvent[]

export function Event2Calendar(event: Event): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end || undefined,
    allDay: event.allDay,
    backgroundColor: '#BFDBFF',
    borderColor: '#BFDBFF',
    type: CalendarEventType.EVENT,
    srcObj: event,
  }
}

// TaskのdueDateを必須に変更した型
export type TaskWithNonNullableDueDate = Omit<Task, 'dueDate'> & {
  dueDate: Date
}

export function Task2Calendar(task: TaskWithNonNullableDueDate): CalendarEvent {
  return {
    id: task.id,
    title: task.title,
    start: task.dueDate,
    end: undefined,
    allDay: false,
    backgroundColor: '#F5D0FE',
    borderColor: '#F5D0FE',
    type: CalendarEventType.TASK,
    srcObj: task,
  }
}

// MemoのrelatedDateを必須に変更した型
export type MemoWithNonNullableRelatedDate = Omit<Memo, 'relatedDate'> & {
  relatedDate: Date
}

export function Memo2Calendar(
  memo: MemoWithNonNullableRelatedDate,
): CalendarEvent {
  return {
    id: memo.id,
    title: memo.title,
    start: memo.relatedDate,
    end: undefined,
    allDay: false,
    backgroundColor: '#FEF08A',
    borderColor: '#FEF08A',
    type: CalendarEventType.MEMO,
    srcObj: memo,
  }
}
