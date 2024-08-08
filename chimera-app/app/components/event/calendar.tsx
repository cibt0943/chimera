import * as React from 'react'
// import type { LinksFunction } from '@remix-run/node'
import { useTranslation } from 'react-i18next'
import { RxCheckCircled, RxPencil2, RxCalendar } from 'react-icons/rx'
import allLocales from '@fullcalendar/core/locales-all'
import {
  DateSelectArg,
  EventContentArg,
  EventClickArg,
} from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Event, CalendarEvents, CalendarEventType } from '~/types/events'
import { EventFormDialog, EventFormDialogProps } from './event-form-dialog'

interface CalendarProps {
  defaultEvents: CalendarEvents
  showId: string
}

export function Calendar({ defaultEvents, showId }: CalendarProps) {
  const { i18n } = useTranslation()

  const [actionEvent, setActionEvent] = React.useState<Event>() // 編集・削除するイベント
  const [isOpenEventFormDialog, setIsOpenEventFormDialog] =
    React.useState(false)

  // イベント編集
  function handleEventClick(arg: EventClickArg) {
    const type = arg.event.extendedProps.type
    const srcObj = arg.event.extendedProps.srcObj
    switch (type) {
      case CalendarEventType.EVENT:
        setActionEvent(srcObj as Event)
        setIsOpenEventFormDialog(true)
        break
      case CalendarEventType.TASK:
        break
      case CalendarEventType.MEMO:
        break
    }
  }

  // イベント追加
  function handleSelect(arg: DateSelectArg) {
    arg.start.setHours(9, 0)
    arg.end.setDate(arg.end.getDate() - 1)
    arg.end.setHours(9, 0)
    const timeDiff = arg.end.getTime() - arg.start.getTime()
    const dayDiff = timeDiff / (1000 * 3600 * 24)
    const [startDate, endDate, allDay] =
      dayDiff < 1 ? [arg.start, null, false] : [arg.start, arg.end, true]

    const event = {
      id: '',
      startDate: startDate,
      endDate: endDate,
      allDay: allDay,
      title: '',
      memo: '',
      location: '',
    } as Event
    setActionEvent(event)
    setIsOpenEventFormDialog(true)
  }

  return (
    <>
      <div className="h-[calc(100vh_-_50px)]">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          height={'100%'}
          locales={allLocales}
          locale={i18n.language}
          headerToolbar={{
            left: 'prev today next',
            center: 'title',
            right: 'dayGridMonth dayGridWeek',
          }}
          viewClassNames={['text-sm', 'text-muted-foreground']}
          editable={true}
          selectable={true}
          select={handleSelect}
          dayHeaderClassNames={(arg) => {
            const result = ['font-normal']
            // switch (arg.date.getDay()) {
            //   case 0:
            //     result.push('bg-red-50')
            //     break
            //   case 6:
            //     result.push('bg-sky-50')
            //     break
            //   default:
            //     result.push('bg-gray-50')
            //     break
            // }
            return result
          }}
          dayCellContent={(arg) => {
            return arg.dayNumberText.replace('日', '')
          }}
          events={defaultEvents}
          eventContent={renderEventContent}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
          }}
          displayEventEnd={true}
          eventInteractive={true}
          eventClassNames={(arg) => {
            return ['text-primary']
          }}
          eventTextColor="black"
          eventClick={handleEventClick}
          eventDataTransform={(eventData) => {
            // fullcalendarは終日の場合、バーが1日前までしか光れないので終了日を1日後に設定
            // しかも2回呼び出されるので、_transformedフラグで2回目の呼び出しをスキップ
            if (!eventData._transformed) {
              const end = eventData.end as Date
              if (eventData.allDay && eventData.end) {
                end.setDate(end.getDate() + 1)
                eventData.end = end
              }
              eventData._transformed = true
            }
            return eventData
          }}
        />
      </div>
      <EventFormDialogMemo
        event={actionEvent}
        isOpen={isOpenEventFormDialog}
        setIsOpen={setIsOpenEventFormDialog}
      />
    </>
  )
}

// a custom render function
function renderEventContent(eventContent: EventContentArg) {
  const { timeText } = eventContent
  const { allDay, title } = eventContent.event
  const backgroundColor = eventContent.event.backgroundColor
  const isListItem = isListItemDisplay(eventContent)

  return (
    <div className="flex items-center">
      {isListItem && <span style={{ color: backgroundColor }}>⚫️</span>}
      {!allDay && <span className="ml-1">{timeText}</span>}
      <span className="ml-1">{title}</span>
      <EventTypeIcon type={eventContent.event.extendedProps.type} />
    </div>
  )
}

function isListItemDisplay(eventContent: EventContentArg) {
  const event = eventContent.event

  if (event.display === 'list-item') return true
  if (event.allDay) return false
  return !event.end || event.start?.toDateString() === event.end.toDateString()
}

function EventTypeIcon({ type }: { type: CalendarEventType }) {
  const className = 'ml-2 h-4 w-4'
  switch (type) {
    case CalendarEventType.EVENT:
      return <RxCalendar className={className} />
    case CalendarEventType.TASK:
      return <RxCheckCircled className={className} />
    case CalendarEventType.MEMO:
      return <RxPencil2 className={className} />
    default:
      return <RxCalendar className={className} />
  }
}

// イベントフォームダイアログのメモ化
const EventFormDialogMemo = React.memo((props: EventFormDialogProps) => {
  return <EventFormDialog {...props} />
})
EventFormDialogMemo.displayName = 'EventFormDialogMemo'
