import * as React from 'react'
import {
  useNavigate,
  useFetcher,
  useSearchParams,
  useLocation,
} from 'react-router'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth } from 'date-fns'
import {
  LuCircleDot,
  LuCirclePlay,
  LuCircleCheck,
  LuCirclePause,
  LuFilePen,
  LuCalendarDays,
} from 'react-icons/lu'
import allLocales from '@fullcalendar/react/locales-all'
import {
  useCalendarController,
  DatesSetInfo,
  DateSelectInfo,
  EventDisplayInfo,
  EventClickInfo,
  EventDropInfo,
  EventResizeDoneInfo,
  EventInput,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import listPlugin from '@fullcalendar/react/list'
import { EventCalendarViews } from '~/components/ui/event-calendar-views'
import { EventCalendarToolbar } from '~/components/event/event-calendar-toolbar'
import { EventCalendarCloseIcon } from '~/components/event/event-calendar-icons'
import { API_URL, TODO_URL, TASK_URL, MEMO_URL, EVENT_URL } from '~/constants'
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
  const [isOpenAddDialog, setIsOpenAddDialog] = React.useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isLaptop = useMedia('(min-width: 1024px)')
  const controller = useCalendarController()
  const redirectUrl = EVENT_URL + location.search

  // 日付セット時の処理
  function handleDatesSet(arg: DatesSetInfo) {
    const startStr = format(arg.view.currentStart, 'yyyy-MM-dd')

    if (viewMode === arg.view.type && startDate === startStr) return

    setSearchParams((prev) => {
      prev.set('view', arg.view.type)
      prev.set('start', startStr)
      return prev
    })
  }

  // イベント編集
  function handleEventClick(arg: EventClickInfo) {
    const { type, srcObj } = arg.event.extendedProps
    const url = getEditUrl(type, srcObj.id)
    url && navigate(url + location.search)
  }

  // 編集画面URLを取得
  function getEditUrl(type: CalendarEventType, id: string) {
    switch (type) {
      case CalendarEventType.EVENT:
        return `${EVENT_URL}/${id}`
      case CalendarEventType.TASK:
        return `${EVENT_URL}${TASK_URL}/${id}`
      case CalendarEventType.MEMO:
        return `${EVENT_URL}${MEMO_URL}/${id}`
      default:
        return null
    }
  }

  // イベント追加
  function handleSelect(arg: DateSelectInfo) {
    const event = createNewEvent(arg.start, arg.end)
    setActionEvent(event)
    setIsOpenAddDialog(true)
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
  function handleEventDrop(arg: EventDropInfo) {
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
      encType: 'application/json',
    })
  }

  // イベントResize
  function handleEventResize(arg: EventResizeDoneInfo) {
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
        action: `${API_URL}${EVENT_URL}/${srcObj.id}`,
        method: 'post',
        encType: 'application/json',
      },
    )
  }

  const viewMode = isLaptop
    ? (searchParams.get('view') ?? 'dayGridMonth')
    : 'listMonth'
  const availableViews = isLaptop
    ? ['dayGridMonth', 'dayGridWeek', 'listMonth']
    : ['listMonth']
  const defaultStartDate = format(startOfMonth(new Date()), 'yyyy-MM-dd')
  const startDate = searchParams.get('start') ?? defaultStartDate

  React.useEffect(() => {
    // 以下のワーニングを回避するために非同期でviewModeを変更
    // Warning: flushSync was called from inside a lifecycle method.
    // React cannot flush when React is already rendering.
    // Consider moving this call to a scheduler task or micro task.
    Promise.resolve().then(() => {
      controller.changeView(viewMode)
    })
  }, [viewMode, controller])

  return (
    <div className="flex h-[calc(100svh-68px)] flex-col gap-5 lg:h-[calc(100svh-32px)]">
      <EventCalendarToolbar
        controller={controller}
        availableViews={availableViews}
      />
      <div className="min-h-0 grow">
        <EventCalendarViews
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          height={'100%'}
          locales={allLocales}
          locale={i18n.language}
          headerToolbar={false}
          datesSet={handleDatesSet}
          initialView={viewMode}
          initialDate={startDate}
          editable={true}
          selectable={true}
          select={handleSelect}
          dayCellTopContent={(arg) => arg.dayNumberText.replace('日', '')}
          listDayFormat={{ day: 'numeric', weekday: 'short' }}
          listDayAltFormat={() => ''}
          popoverCloseContent={() => <EventCalendarCloseIcon />}
          events={defaultEvents}
          eventContent={renderEventContent}
          eventTimeFormat={{ hour: 'numeric', minute: '2-digit' }}
          displayEventEnd={true}
          eventInteractive={true}
          eventClick={handleEventClick}
          eventDataTransform={transformEventData}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          controller={controller}
        />
      </div>
      <EventFormDialogMemo
        event={actionEvent}
        redirectUrl={redirectUrl}
        isOpen={isOpenAddDialog}
        onOpenChange={async (open) => {
          setIsOpenAddDialog(open)
          if (open) return
          navigate(redirectUrl)
        }}
        onSubmit={() => setIsOpenAddDialog(false)} // 追加保存後にダイアログを閉じる
      />
    </div>
  )
}

function createEventDropRequest(
  startDate: Date,
  endDate: Date | null,
  srcObj: Event,
) {
  copyTime(srcObj.startDate, startDate)

  // fullcalendarは終日の場合、終了日の値が1日後の日付になるので1日前に変更
  if (endDate) {
    srcObj.allDay && endDate.setDate(endDate.getDate() - 1)
    copyTime(srcObj.endDate, endDate)
  }

  return {
    data: {
      id: srcObj.id,
      startDate: startDate.toISOString(),
      allDay: srcObj.allDay ? 'on' : '',
      ...(endDate && { endDate: endDate.toISOString() }),
    },
    action: `${API_URL}${EVENT_URL}/${srcObj.id}`,
  }
}

function createTaskDropRequest(startDate: Date, srcObj: Task) {
  copyTime(srcObj.dueDate, startDate)

  return {
    data: {
      id: srcObj.id,
      dueDate: startDate.toISOString(),
      dueDateAllDay: srcObj.dueDateAllDay ? 'on' : '',
    },
    action: `${API_URL}${TODO_URL}/${srcObj.todoId}`,
  }
}

function createMemoDropRequest(startDate: Date, srcObj: Memo) {
  copyTime(srcObj.relatedDate, startDate)

  return {
    data: {
      id: srcObj.id,
      relatedDate: startDate.toISOString(),
      relatedDateAllDay: srcObj.relatedDateAllDay ? 'on' : '',
    },
    action: `${API_URL}${MEMO_URL}/${srcObj.id}`,
  }
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
function renderEventContent(eventContent: EventDisplayInfo) {
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
      return LuCalendarDays
    case CalendarEventType.TASK:
      switch ((srcObj as Task).status) {
        case TaskStatus.NEW:
          return LuCircleDot
        case TaskStatus.DOING:
          return LuCirclePlay
        case TaskStatus.DONE:
          return LuCircleCheck
        case TaskStatus.PENDING:
          return LuCirclePause
        default:
          return LuCirclePlay
      }
    case CalendarEventType.MEMO:
      return LuFilePen
    default:
      return LuCalendarDays
  }
}

// イベントフォームダイアログのメモ化
const EventFormDialogMemo = React.memo((props: EventFormDialogProps) => {
  return <EventFormDialog {...props} />
})
EventFormDialogMemo.displayName = 'EventFormDialogMemo'
