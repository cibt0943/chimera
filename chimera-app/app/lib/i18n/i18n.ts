import * as React from 'react'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import translationEn from '~/lib/i18n/locales/en/translation.json'
import translationJa from '~/lib/i18n/locales/ja/translation.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        translation: translationEn,
      },
      'ja-JP': {
        translation: translationJa,
      },
    },
    // debug: true, // 開発モードでデバッグログを出力
    fallbackLng: 'en-US', // 言語が見つからなかった場合のフォールバック
    supportedLngs: ['en-US', 'ja-JP'], // サポートする言語
    load: 'currentOnly',
    interpolation: {
      escapeValue: false, // ReactはXSS対策を既に行っているため
    },
    react: {
      useSuspense: false, // Turn off suspense for SSR
    },
    detection: {
      // デフォルト→https://github.com/i18next/i18next-browser-languageDetector/blob/9efebe6ca0271c3797bc09b84babf1ba2d9b4dbb/src/index.js#L11
      order: [
        'querystring',
        'cookie',
        'localStorage',
        'sessionStorage',
        'navigator',
        'htmlTag',
        'path',
        'subdomain',
      ],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n

export function useLanguage(locale: string) {
  React.useEffect(() => {
    i18n.changeLanguage(locale)
  }, [locale])
}
