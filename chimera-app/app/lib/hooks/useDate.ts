import { useTranslation } from 'react-i18next'
import {
  formatDistanceToNowStrict,
  differenceInSeconds,
  format,
  isSameDay,
  isSameYear,
} from 'date-fns'
import { getLocale } from '~/lib/utils'

export function useAgoFormat(date: Date): string {
  const { i18n, t } = useTranslation()
  const local = getLocale(i18n.language)

  const seconds = differenceInSeconds(new Date(), date)
  if (seconds < 60) {
    return t('common.format.less_than_1_minute')
  }

  return formatDistanceToNowStrict(date, { locale: local, addSuffix: true })
}

export function useDateDiffFormat(targetDate: Date, baseDate?: Date): string {
  const { t } = useTranslation()
  baseDate = baseDate || new Date()

  if (isSameDay(baseDate, targetDate)) {
    return format(targetDate, t('common.format.time_short_format'))
  } else if (isSameYear(baseDate, targetDate)) {
    return format(targetDate, t('common.format.date_short_time_short_format'))
  } else {
    return format(targetDate, t('common.format.date_time_short_format'))
  }
}
