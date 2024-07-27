// import type { LinksFunction } from '@remix-run/node'
import { useTranslation } from 'react-i18next'
import { Events } from '~/types/events'
import allLocales from '@fullcalendar/core/locales-all'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction'

interface CalendarProps {
  defaultEvents: Events
  showId: string
}

export function Calendar({ defaultEvents, showId }: CalendarProps) {
  const { i18n, t } = useTranslation()

  const handleDateClick = (arg: DateClickArg) => {
    alert(arg.dateStr)
  }

  return (
    <div className="h-[calc(100vh_-_50px)]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        height={'100%'}
        // firstDay={1}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek',
        }}
        initialView="dayGridMonth"
        businessHours={true}
        // weekends={false}
        editable={true}
        selectable={true}
        events={defaultEvents}
        eventContent={renderEventContent}
        locales={allLocales}
        locale={i18n.language}
        dateClick={handleDateClick}
      />
    </div>
  )
}

// a custom render function
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  )
}
