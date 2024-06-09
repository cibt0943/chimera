import * as zod from 'zod'

export const Language = {
  AUTO: 'auto',
  EN: 'en',
  JA: 'ja',
} as const
export type Language = (typeof Language)[keyof typeof Language]

// 利用可能な言語リスト
export const LanguageList = [
  { value: Language.AUTO, label: 'account.model.language-type.auto' },
  { value: Language.EN, label: 'account.model.language-type.en' },
  { value: Language.JA, label: 'account.model.language-type.ja' },
]

export const Theme = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const
export type Theme = (typeof Theme)[keyof typeof Theme]

// 利用可能な言語リスト
export const ThemeList = [
  { value: Theme.SYSTEM, label: 'account.model.theme-type.system' },
  { value: Theme.LIGHT, label: 'account.model.theme-type.light' },
  { value: Theme.DARK, label: 'account.model.theme-type.dark' },
]

export type AccountModel = {
  id: number
  sub: string
  language: string
  timezone: string
  theme: string
  created_at: string
  updated_at: string
}

export type Account = {
  id: number
  sub: string
  name: string
  email: string
  email_verified: boolean
  picture: string
  language: string
  timezone: string
  theme: string
  created_at: string
  updated_at: string
}

export type Auth0User = {
  sub: string
  // nickname: string
  name: string
  email: string
  email_verified: boolean
  picture: string
  updated_at: string
}

// Auth0のユーザー情報とDBのアカウント情報をマージしてAccountオブジェクトを生成
export function Auth0UserAndAccountModel2Account(
  auth0User: Auth0User,
  accountModel: AccountModel,
): Account {
  return {
    id: accountModel.id,
    sub: accountModel.sub,
    name: auth0User.name,
    email: auth0User.email,
    email_verified: auth0User.email_verified,
    picture: auth0User.picture,
    language: accountModel.language,
    timezone: accountModel.timezone,
    theme: accountModel.theme,
    created_at: accountModel.created_at,
    updated_at:
      accountModel.updated_at > auth0User.updated_at
        ? accountModel.updated_at
        : auth0User.updated_at,
  }
}

export function Account2AccountModel(account: Account): AccountModel {
  return {
    id: account.id,
    sub: account.sub,
    language: account.language,
    timezone: account.timezone,
    theme: account.theme,
    created_at: account.created_at,
    updated_at: account.updated_at,
  }
}

export const AccountSchema = zod.object({
  name: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  language: zod.nativeEnum(Language, {
    message: '不正な値が選択されています。',
  }),
  theme: zod.nativeEnum(Theme, {
    message: '不正な値が選択されています。',
  }),
})

export type AccountSchemaType = zod.infer<typeof AccountSchema>
