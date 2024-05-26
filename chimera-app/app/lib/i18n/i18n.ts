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
      en: {
        translation: translationEn,
      },
      ja: {
        translation: translationJa,
      },
    },
    fallbackLng: 'en', // 言語が見つからなかった場合のフォールバック
    // debug: true, // 開発モードでデバッグログを出力
    supportedLngs: ['en', 'ja'], // サポートする言語
    interpolation: {
      escapeValue: false, // ReactはXSS対策を既に行っているため
    },
    // react: {
    //   useSuspense: false, // Turn off suspense for SSR
    // },
    // detection: {
    //   order: [
    //     'querystring',
    //     'cookie',
    //     'localStorage',
    //     'navigator',
    //     'htmlTag',
    //     'path',
    //     'subdomain',
    //   ],
    //   caches: ['localStorage', 'cookie'],
    // },
  })

export default i18n
