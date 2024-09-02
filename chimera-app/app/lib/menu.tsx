import {
  RxCheckCircled,
  RxPencil2,
  RxCalendar,
  RxFile,
  RxPaperPlane,
} from 'react-icons/rx'
import { RiBook3Line } from 'react-icons/ri'
import {
  TODO_URL,
  MEMO_URL,
  EVENT_URL,
  DAILY_NOTE_URL,
  FILE_URL,
  REMINDER_URL,
} from '~/constants'

export const MenuList = [
  { title: 'todo.menu_label', url: TODO_URL, icon: RxCheckCircled },
  { title: 'memo.menu_label', url: MEMO_URL, icon: RxPencil2 },
  { title: 'event.menu_label', url: EVENT_URL, icon: RxCalendar },
  {
    title: 'daily_note.menu_label',
    url: DAILY_NOTE_URL,
    icon: RiBook3Line,
  },
  { title: 'file.menu_label', url: FILE_URL, icon: RxFile },
  {
    title: 'reminder.menu_label',
    url: REMINDER_URL,
    icon: RxPaperPlane,
  },
]
