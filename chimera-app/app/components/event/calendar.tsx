// import type { LinksFunction } from '@remix-run/node'
import { useTranslation } from 'react-i18next'
import { RxCheckCircled, RxPencil2, RxCalendar } from 'react-icons/rx'
import { CalendarEvents, CalendarEventType } from '~/types/events'
import allLocales from '@fullcalendar/core/locales-all'
import { EventContentArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'

interface CalendarProps {
  defaultEvents: CalendarEvents
  showId: string
}

export function Calendar({ defaultEvents, showId }: CalendarProps) {
  const { i18n } = useTranslation()

  const handleDateClick = (arg: DateClickArg) => {
    alert(arg.dateStr)
  }

  return (
    <div className="h-[calc(100vh_-_50px)]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        height={'100%'}
        headerToolbar={{
          left: 'prev today next',
          center: 'title',
          right: 'dayGridMonth dayGridWeek',
        }}
        viewClassNames={['text-sm', 'text-muted-foreground']}
        // businessHours={true}
        editable={true}
        selectable={true}
        events={defaultEvents}
        eventContent={renderEventContent}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
        }}
        eventInteractive={true}
        eventClassNames={(arg) => {
          return ['text-primary']
        }}
        eventTextColor="black"
        locales={allLocales}
        locale={i18n.language}
        dateClick={handleDateClick}
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
      />
    </div>
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
  switch (type) {
    case CalendarEventType.EVENT:
      return <RxCalendar className="ml-2 h-4 w-4" />
    case CalendarEventType.TASK:
      return <RxCheckCircled className="ml-2 h-4 w-4" />
    case CalendarEventType.MEMO:
      return <RxPencil2 className="ml-2 h-4 w-4" />
    default:
      return <RxCalendar className="ml-2 h-4 w-4" />
  }
}
