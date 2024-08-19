import { toDate } from 'date-fns'
import * as zod from 'zod'
import type { Database } from '~/types/schema'
import { Task } from '~/types/tasks'
import { Memo } from '~/types/memos'

// DBのイベントテーブルの型
export type EventModel = Database['public']['Tables']['events']['Row']
export type InsertEventModel = Database['public']['Tables']['events']['Insert']
export type UpdateEventModel =
  Database['public']['Tables']['events']['Update'] & { id: string } // idを必須で上書き

// イベントの型
export type Event = {
  id: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  startDate: Date
  endDate: Date | null
  allDay: boolean
  title: string
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
    startDate: toDate(eventModel.start_datetime),
    endDate: eventModel.end_datetime ? toDate(eventModel.end_datetime) : null,
    allDay: eventModel.all_day,
    title: eventModel.title,
    memo: eventModel.memo,
    location: eventModel.location,
  }
}

export const EventSchema = zod
  .object({
    startDate: zod.date({ required_error: '必須項目です' }),
    endDate: zod.date().optional(),
    allDay: zod.boolean().optional(), // boolean型の場合はfalseの時に値が送信されないためoptionalが必要
    title: zod
      .string({ required_error: '必須項目です' })
      .max(255, { message: '255文字以内で入力してください' }),
    memo: zod.string().max(10000, '10000文字以内で入力してください').optional(),
    location: zod
      .string()
      .max(10000, '10000文字以内で入力してください')
      .optional(),
  })
  .refine(
    ({ startDate, endDate }) => {
      if (!startDate || !endDate) return true // 終了日が未設定の場合はチェックしない
      return startDate <= endDate // 終了日が開始日より未来かどうか
    },
    {
      message: '開始より後の日時を指定してください',
      path: ['endDate'],
    },
  )

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
  start: Date
  end: Date | undefined
  allDay: boolean
  title: string
  backgroundColor: string
  borderColor: string
  // 下記はFullCalendarには無い独自追加のプロパティ
  type: CalendarEventType
  srcObj: Event | Task | Memo
  className?: string
  durationEditable?: boolean
}

export type CalendarEvents = CalendarEvent[]

export function Event2Calendar(event: Event): CalendarEvent {
  return {
    id: event.id,
    start: event.startDate,
    end: event.endDate || undefined,
    allDay: event.allDay,
    title: event.title,
    backgroundColor: '#BFDBFF',
    borderColor: '#BFDBFF',
    type: CalendarEventType.EVENT,
    srcObj: event,
    durationEditable: true,
  }
}

// TaskのdueDateを必須に変更した型
export type TaskWithNonNullableDueDate = Task & { dueDate: Date } // dueDateを必須で上書き

export function Task2Calendar(task: TaskWithNonNullableDueDate): CalendarEvent {
  return {
    id: task.id,
    start: task.dueDate,
    end: undefined,
    allDay: task.dueDateAllDay,
    title: task.title,
    backgroundColor: '#F5D0FE',
    borderColor: '#F5D0FE',
    type: CalendarEventType.TASK,
    srcObj: task,
    durationEditable: false,
  }
}

// MemoのrelatedDateを必須に変更した型
export type MemoWithNonNullableRelatedDate = Memo & { relatedDate: Date }

export function Memo2Calendar(
  memo: MemoWithNonNullableRelatedDate,
): CalendarEvent {
  return {
    id: memo.id,
    start: memo.relatedDate,
    end: undefined,
    allDay: memo.relatedDateAllDay,
    title: memo.title,
    backgroundColor: '#FEF08A',
    borderColor: '#FEF08A',
    type: CalendarEventType.MEMO,
    srcObj: memo,
    durationEditable: false,
  }
}
