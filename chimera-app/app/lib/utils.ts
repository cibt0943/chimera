import * as React from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useNavigation } from '@remix-run/react'
import { useTranslation } from 'react-i18next'
import {
  formatDistanceToNowStrict,
  Locale,
  format,
  isSameDay,
  isSameYear,
} from 'date-fns'
import * as locales from 'date-fns/locale'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnVoidFunctionType = (...args: any[]) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReturnPromiseVoidFunctionType = (...args: any[]) => Promise<void>

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(waitMsec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitMsec))
}

// 関数を指定した時間が経過するまでは、同じ関数の実行を抑制するフック
export function useDebounce(
  func: ReturnVoidFunctionType,
  delay: number,
): (...args: Parameters<ReturnVoidFunctionType>) => void {
  const timerId = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  return React.useCallback(
    (...args: Parameters<ReturnVoidFunctionType>) => {
      if (timerId.current) {
        clearTimeout(timerId.current)
      }
      timerId.current = setTimeout(() => {
        func(...args)
      }, delay)
    },
    [func, delay],
  )
}

// キューを使って非同期処理を順次実行するフック
export function useQueue() {
  const queue = React.useRef<ReturnPromiseVoidFunctionType[]>([])
  const processing = React.useRef<boolean>(false)

  // キューにリクエストを追加し、処理を開始する
  const enqueue = (func: ReturnPromiseVoidFunctionType) => {
    queue.current.push(func)
    processNext()
  }

  // キューから次のリクエストを取り出して実行
  const processNext = async () => {
    if (processing.current) return
    if (queue.current.length === 0) return

    processing.current = true
    const nextFunc = queue.current.shift()!
    await nextFunc().catch(console.error)
    processing.current = false
    processNext()
  }

  return { enqueue }
}

export function useIsLoading() {
  const navigation = useNavigation()
  return ['loading', 'submitting'].includes(navigation.state)
}

export function useIsLoadingEffect() {
  const navigation = useNavigation()
  return useIsLoading() && navigation.location?.state?.isLoadEffect === true
}

// date-fnsのlocaleを取得
export function getLocale(locale: string): Locale {
  return locales[locale as keyof typeof locales] || locales.ja
}

export function useAgoFormat(date: Date): string {
  const { i18n } = useTranslation()
  const local = getLocale(i18n.language)
  return formatDistanceToNowStrict(date, { locale: local, addSuffix: true })
}

export function useDateDiffFormat(targetDate: Date, baseDate?: Date): string {
  const { t } = useTranslation()
  if (!baseDate) {
    baseDate = new Date()
  }

  if (isSameDay(baseDate, targetDate)) {
    return format(targetDate, t('common.format.time_short_format'))
  } else if (isSameYear(baseDate, targetDate)) {
    return format(targetDate, t('common.format.date_short_time_short_format'))
  } else {
    return format(targetDate, t('common.format.date_time_short_format'))
  }
}
