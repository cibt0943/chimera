import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Locale } from 'date-fns'
import * as locales from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(waitMsec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitMsec))
}

export const isBrowser = typeof window !== 'undefined'

// date-fnsのlocaleを取得
export function getLocale(locale: string): Locale {
  locale = locale.replaceAll('-', '')
  return locales[locale as keyof typeof locales] || locales.ja
}
