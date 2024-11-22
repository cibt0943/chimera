import {
  LuListTodo,
  LuFileEdit,
  LuCalendarDays,
  LuBook,
  LuAlarmCheck,
} from 'react-icons/lu'
import {
  TODO_URL,
  MEMO_URL,
  EVENT_URL,
  DAILY_NOTE_URL,
  REMINDER_URL,
} from '~/constants'

export const MenuList = [
  { title: 'todo.menu_label', url: TODO_URL, icon: LuListTodo },
  { title: 'memo.menu_label', url: MEMO_URL, icon: LuFileEdit },
  { title: 'event.menu_label', url: EVENT_URL, icon: LuCalendarDays },
  {
    title: 'daily_note.menu_label',
    url: DAILY_NOTE_URL,
    icon: LuBook,
  },
  {
    title: 'reminder.menu_label',
    url: REMINDER_URL,
    icon: LuAlarmCheck,
  },
]
