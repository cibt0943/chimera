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
    // サーバーサイドではOSが判定できないためUNKNOWNを返す
    return OS.UNKNOWN
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  if (userAgent.indexOf('windows') !== -1) {
    return OS.WIN
  } else if (userAgent.indexOf('mac') !== -1) {
    return OS.MAC
  } else if (userAgent.indexOf('linux') !== -1) {
    return OS.LINUX
  } else if (/iphone|ipad|ipod/.test(userAgent)) {
    return OS.IOS
  } else if (userAgent.indexOf('android') !== -1) {
    return OS.ANDROID
  }
  return OS.UNKNOWN
}

// ユーザーのOSを判定するカスタムフック
export interface UserAgent {
  OS: OS
  isWindows: boolean
  isMac: boolean
}

// ユーザーエージェント情報を取得する関数
export function getUserAgent(): UserAgent {
  const userOS = getOS()
  return {
    OS: userOS,
    isWindows: userOS === OS.WIN,
    isMac: userOS === OS.MAC,
  }
}

export function getModifierKeyInfo(userOS: OS) {
  return {
    modifierKey: userOS === OS.WIN ? 'mod' : 'alt',
    modifierKeyIcon: userOS === OS.WIN ? 'alt' : '⌥',
  }
}
