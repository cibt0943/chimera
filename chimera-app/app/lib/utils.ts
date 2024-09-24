import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Locale } from 'date-fns'
import * as locales from 'date-fns/locale'
import { OS } from '~/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(waitMsec: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, waitMsec))
}

// date-fnsのlocaleを取得
export function getLocale(locale: string): Locale {
  locale = locale.replaceAll('-', '')
  return locales[locale as keyof typeof locales] || locales.ja
}

// サーバーサイドかどうかを判定する関数
export function isServerSide() {
  return typeof window === 'undefined'
}

// ユーザーのOSを判定する関数
export function getOS(): OS {
  if (isServerSide()) {
    return OS.UNKNOWN // サーバーサイドではOSが判定できないため
  }

  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform

  if (platform.startsWith('Win')) {
    return OS.WIN
  } else if (platform.startsWith('Mac')) {
    return OS.MAC
  } else if (/Android/.test(userAgent)) {
    return OS.ANDROID
  } else if (/iPhone|iPad|iPod/.test(userAgent)) {
    return OS.IOS
  } else if (/Linux/.test(platform)) {
    return OS.LINUX
  }
  return OS.UNKNOWN
}

// ユーザーのOSを判定するカスタムフック
export interface UserAgent {
  userOS: OS
  isWindows: boolean
  isMac: boolean
  modifierKey: string
  modifierKeyIcon: string
}

// ユーザーエージェント情報を取得する関数
export function getUserAgent(): UserAgent {
  const userOS = getOS()
  return {
    userOS,
    isWindows: userOS === OS.WIN,
    isMac: userOS === OS.MAC,
    modifierKey: userOS === OS.WIN ? 'mod' : 'alt',
    modifierKeyIcon: userOS === OS.WIN ? 'alt' : '⌥',
  }
}
