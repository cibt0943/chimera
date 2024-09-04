import * as React from 'react'
import {
  useNavigate,
  useFetcher,
  useSearchParams,
  useLocation,
} from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth } from 'date-fns'
import {
  RiCircleLine,
  RiProgress4Line,
  RiProgress8Line,
  RiProhibited2Line,
} from 'react-icons/ri'
import { RxPencil2, RxCalendar } from 'react-icons/rx'
import allLocales from '@fullcalendar/core/locales-all'
import {
  DatesSetArg,
  DateSelectArg,
  EventContentArg,
  EventClickArg,
  EventInput,
  EventDropArg,
} from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, {
  EventResizeDoneArg,
} from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import { API_URL, TODO_URL, MEMO_URL, EVENT_URL } from '~/constants'
import { useMedia } from '~/lib/hooks'
import { Event, CalendarEvents, CalendarEventType } from '~/types/events'
import { Task, TaskStatus } from '~/types/tasks'
import { Memo } from '~/types/memos'
import { EventFormDialog, EventFormDialogProps } from './event-form-dialog'

interface CalendarProps {
  defaultEvents: CalendarEvents
}

export function Calendar({ defaultEvents }: CalendarProps) {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [actionEvent, setActionEvent] = React.useState<Event>() // イベント作成用
  const [isOpenEventDialog, setIsOpenEventDialog] = React.useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isLaptop = useMedia('(min-width: 1024px)')
  const callenderRef = React.useRef<FullCalendar>(null)

  // 日付セット時の処理
  function handleDatesSet(arg: DatesSetArg) {
    if (viewMode !== arg.view.type) {
      setSearchParams((prev) => {
        prev.set('view', arg.view.type)
        return prev
      })
    }

    const startStr = format(arg.view.currentStart, 'yyyy-MM-dd')
    if (startDate !== startStr) {
      setSearchParams((prev) => {
        prev.set('start', startStr)
        return prev
      })
    }
  }

  // イベント編集
  function handleEventClick(arg: EventClickArg) {
    const { type, srcObj } = arg.event.extendedProps
    const url = getEditUrl(type, srcObj.id)
    url && navigate(url + location.search)
  }

  // 編集画面URLを取得
  function getEditUrl(type: CalendarEventType, id: string) {
    switch (type) {
      case CalendarEventType.EVENT:
        return [EVENT_URL, id].join('/')
      case CalendarEventType.TASK:
        return [EVENT_URL, TODO_URL, '/' + id].join('')
      case CalendarEventType.MEMO:
        return [EVENT_URL, MEMO_URL, '/' + id].join('')
      default:
        return null
    }
  }

  // イベント追加
  function handleSelect(arg: DateSelectArg) {
    const event = createNewEvent(arg.start, arg.end)
    setActionEvent(event)
    setIsOpenEventDialog(true)
  }

  // 新しいイベントを作成
  function createNewEvent(start: Date, end: Date): Event {
    start.setHours(9, 0)
    end.setDate(end.getDate() - 1)
    end.setHours(9, 0)
    const timeDiff = end.getTime() - start.getTime()
    const dayDiff = timeDiff / (1000 * 3600 * 24)
    const [startDate, endDate, allDay] =
      dayDiff < 1 ? [start, null, false] : [start, end, true]

    return {
      id: '',
      startDate: startDate,
      endDate: endDate,
      allDay: allDay,
      title: '',
      memo: '',
      location: '',
    } as Event
  }

  // イベントDrop
  function handleEventDrop(arg: EventDropArg) {
    const { type, srcObj } = arg.event.extendedProps

    const startDate = arg.event.start
    if (!startDate) return
    const endDate = arg.event.end

    let request
    switch (type) {
      case CalendarEventType.EVENT:
        request = createEventDropRequest(startDate, endDate, srcObj)
        break
      case CalendarEventType.TASK:
        request = createTaskDropRequest(startDate, srcObj)
        break
      case CalendarEventType.MEMO:
        request = createMemoDropRequest(startDate, srcObj)
        break
      default:
        return
    }

    fetcher.submit(request.data, {
      action: request.action,
      method: 'post',
    })
  }

  // イベントResize
  function handleEventResize(arg: EventResizeDoneArg) {
    const { type, srcObj } = arg.event.extendedProps

    if (type !== CalendarEventType.EVENT) return
    if (!arg.event.start || !arg.event.end) return

    const startDate = arg.event.start
    const endDate = arg.event.end

    copyTime(srcObj.startDate, startDate)

    // fullcalendarは終日の場合、終了日の値が1日後の日付になるので1日前に変更
    if (endDate) {
      srcObj.allDay && endDate.setDate(endDate.getDate() - 1)
      copyTime(srcObj.endDate, endDate)
    }

    fetcher.submit(
      {
        id: srcObj.id,
        startDate: arg.event.start.toISOString(),
        allDay: srcObj.allDay ? 'on' : '',
        ...(endDate && { endDate: endDate.toISOString() }),
      },
      {
        action: [API_URL, EVENT_URL, '/' + srcObj.id].join(''),
        method: 'post',
      },
    )
  }

  const viewMode = isLaptop
    ? searchParams.get('view') || 'dayGridMonth'
    : 'listMonth'
  const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const startDate = searchParams.get('start') || defaultStartDate
  const headerToolbarRight = isLaptop
    ? 'dayGridMonth dayGridWeek listMonth'
    : ''

  React.useEffect(() => {
    // 以下のワーニングを回避するために非同期でviewModeを変更
    // Warning: flushSync was called from inside a lifecycle method.
    // React cannot flush when React is already rendering.
    // Consider moving this call to a scheduler task or micro task.
    Promise.resolve().then(() => {
      if (!callenderRef.current) return
      callenderRef.current.getApi().changeView(viewMode)
    })
  }, [viewMode])

  return (
    <div className="h-[calc(100dvh_-_72px)] xl:h-[calc(100dvh_-_32px)]">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        height={'100%'}
        locales={allLocales}
        locale={i18n.language}
        headerToolbar={{
          left: 'prev today next',
          center: 'title',
          right: headerToolbarRight,
        }}
        datesSet={handleDatesSet}
        initialView={viewMode}
        initialDate={startDate}
        viewClassNames={['text-sm', 'text-muted-foreground']}
        editable={true}
        selectable={true}
        select={handleSelect}
        dayHeaderClassNames={['font-normal']}
        dayCellContent={(arg) => arg.dayNumberText.replace('日', '')}
        listDayFormat={{ day: 'numeric', weekday: 'short' }}
        listDaySideFormat={() => ''}
        events={defaultEvents}
        eventContent={renderEventContent}
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit' }}
        displayEventEnd={true}
        eventInteractive={true}
        eventClassNames={['text-primary']}
        eventTextColor="black"
        eventClick={handleEventClick}
        eventDataTransform={transformEventData}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        ref={callenderRef}
      />
      <EventFormDialogMemo
        event={actionEvent}
        isOpen={isOpenEventDialog}
        setIsOpen={setIsOpenEventDialog}
        returnUrl={EVENT_URL + location.search}
      />
    </div>
  )
}

function createEventDropRequest(
  startDate: Date,
  endDate: Date | null,
  srcObj: Event,
) {
  const request = { data: {}, action: '' }
  copyTime(srcObj.startDate, startDate)

  // fullcalendarは終日の場合、終了日の値が1日後の日付になるので1日前に変更
  if (endDate) {
    srcObj.allDay && endDate.setDate(endDate.getDate() - 1)
    copyTime(srcObj.endDate, endDate)
  }

  request.data = {
    id: srcObj.id,
    startDate: startDate,
    allDay: srcObj.allDay ? 'on' : '',
    ...(endDate && { endDate }),
  }
  request.action = [API_URL, EVENT_URL, '/' + srcObj.id].join('')
  return request
}

function createTaskDropRequest(startDate: Date, srcObj: Task) {
  const request = { data: {}, action: '' }
  copyTime(srcObj.dueDate, startDate)

  request.data = {
    id: srcObj.id,
    dueDate: startDate,
    dueDateAllDay: srcObj.dueDateAllDay ? 'on' : '',
  }
  request.action = [API_URL, TODO_URL, '/' + srcObj.id].join('')
  return request
}

function createMemoDropRequest(startDate: Date, srcObj: Memo) {
  const request = { data: {}, action: '' }
  copyTime(srcObj.relatedDate, startDate)

  request.data = {
    id: srcObj.id,
    relatedDate: startDate,
    relatedDateAllDay: srcObj.relatedDateAllDay ? 'on' : '',
  }
  request.action = [API_URL, MEMO_URL, '/' + srcObj.id].join('')
  return request
}

// Date型の時刻部分をコピー
function copyTime(from: Date | null, to: Date | null) {
  if (!from || !to) return
  to.setHours(from.getHours(), from.getMinutes(), 0)
}

// イベントデータを変換
// fullcalendarは終日の場合、バーが1日前までしか引かれないので終了日を1日後に設定
// しかも2回呼び出されるので、_transformedフラグで2回目の呼び出しをスキップ
function transformEventData(eventData: EventInput) {
  if (!eventData._transformed) {
    const end = eventData.end as Date
    if (eventData.allDay && eventData.end) {
      end.setDate(end.getDate() + 1)
      eventData.end = end
    }
    eventData._transformed = true
  }
  return eventData
}

// イベント表示用コンポーネント
function renderEventContent(eventContent: EventContentArg) {
  const { timeText } = eventContent
  const { title } = eventContent.event
  const { type, srcObj } = eventContent.event.extendedProps

  const Icon = EventTypeIcon({ type, srcObj })

  return (
    <div className="flex items-center truncate" title={title}>
      <div>
        <Icon className="ml-1 h-4 w-4" />
      </div>
      {timeText && <div className="ml-1">{timeText}</div>}
      <div className="ml-1 font-semibold">{title}</div>
    </div>
  )
}

function EventTypeIcon({
  type,
  srcObj,
}: {
  type: CalendarEventType
  srcObj: Event | Task | Memo
}) {
  switch (type) {
    case CalendarEventType.EVENT:
      return RxCalendar
    case CalendarEventType.TASK:
      switch ((srcObj as Task).status) {
        case TaskStatus.NEW:
          return RiCircleLine
        case TaskStatus.DOING:
          return RiProgress4Line
        case TaskStatus.DONE:
          return RiProgress8Line
        case TaskStatus.PENDING:
          return RiProhibited2Line
        default:
          return RiCircleLine
      }
    case CalendarEventType.MEMO:
      return RxPencil2
    default:
      return RxCalendar
  }
}

// イベントフォームダイアログのメモ化
const EventFormDialogMemo = React.memo((props: EventFormDialogProps) => {
  return <EventFormDialog {...props} />
})
EventFormDialogMemo.displayName = 'EventFormDialogMemo'
