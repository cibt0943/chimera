export const API_URL = '/api'
export const ACCOUNT_URL = '/account'
export const TODO_URL = '/todos'
export const MEMO_URL = '/memos'
export const EVENT_URL = '/events'
export const DAILY_NOTE_URL = '/daily-notes'
export const FILE_URL = '/files'
export const REMINDER_URL = '/reminders'

export const OS = {
  WIN: 'Windows',
  MAC: 'macOS',
  ANDROID: 'Android',
  IOS: 'iOS',
  LINUX: 'Linux',
  UNKNOWN: 'Unknown',
} as const
export type OS = (typeof OS)[keyof typeof OS]
