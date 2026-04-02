import { LuSun, LuMoonStar, LuMonitor } from 'react-icons/lu'
import * as zod from 'zod'

export const Language = {
  AUTO: 'auto',
  EN: 'en-US',
  JA: 'ja-JP',
} as const
export type Language = (typeof Language)[keyof typeof Language]

// 利用可能な言語リスト
export const LanguageList = [
  { value: Language.AUTO, label: 'account.model.language_list.auto' },
  { value: Language.EN, label: 'account.model.language_list.en' },
  { value: Language.JA, label: 'account.model.language_list.ja' },
]

export const Theme = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const
export type Theme = (typeof Theme)[keyof typeof Theme]

// 利用可能な言語リスト
export const ThemeList = [
  {
    value: Theme.SYSTEM,
    label: 'account.model.theme_list.system',
    icon: LuMonitor,
  },
  {
    value: Theme.LIGHT,
    label: 'account.model.theme_list.light',
    icon: LuSun,
  },
  {
    value: Theme.DARK,
    label: 'account.model.theme_list.dark',
    icon: LuMoonStar,
  },
]

// アカウントの型
export type Account = {
  id: string
  createdAt: Date
  updatedAt: Date
  sub: string
  language: Language
  timezone: string
  theme: Theme
}

// Auth0ユーザーの型
export type Auth0User = {
  updated_at: string
  sub: string
  name: string
  email: string
  email_verified: boolean
  picture: string
}

// ログインセッションの型
export type LoginInfo = {
  auth0User: Auth0User
  account: Account
}

// アカウント設定の型
export type AccountSettings = {
  general: AccountGeneral
  password: AccountPassword
}

// アカウント設定：一般の型
export type AccountGeneral = {
  name: string
  language: Language
  theme: Theme
}
// アカウント設定：パスワードの型
export type AccountPassword = {
  lastLogin: Date
  lastPasswordChange: Date | undefined
}

export const AccountGeneralSchema = zod.object({
  name: zod
    .string({
      error: (issue) =>
        issue.input === undefined ? '必須項目です' : '入力値が不正です',
    })
    .max(255, { message: '255文字以内で入力してください' }),
  language: zod.enum(Language, {
    message: '不正な値が選択されています。',
  }),
  theme: zod.enum(Theme, {
    message: '不正な値が選択されています。',
  }),
})

export type AccountGeneralSchemaType = zod.infer<typeof AccountGeneralSchema>
