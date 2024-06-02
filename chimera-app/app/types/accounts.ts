import * as zod from 'zod'

export const LanguageType = {
  EN: 'en',
  JP: 'jp',
  AUTO: 'auto',
} as const
export type LanguageType = (typeof LanguageType)[keyof typeof LanguageType]

// 利用可能な言語リスト
export const LanguageTypeList = [
  { value: LanguageType.AUTO, label: '自動検出' },
  { value: LanguageType.EN, label: 'English' },
  { value: LanguageType.JP, label: '日本語' },
]

export type AccountModel = {
  id: number
  sub: string
  language: string
  timezone: string
  created_at: string
  updated_at: string
}

export type Account = {
  id: number
  sub: string
  name: string
  email: string
  picture: string
  language: string
  timezone: string
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
    picture: auth0User.picture,
    language: accountModel.language,
    timezone: accountModel.timezone,
    created_at: accountModel.created_at,
    updated_at:
      accountModel.updated_at > auth0User.updated_at
        ? accountModel.updated_at
        : auth0User.updated_at,
  }
}

export const AccountSchema = zod.object({
  name: zod
    .string({ required_error: '必須項目です' })
    .max(255, { message: '255文字以内で入力してください' }),
  language: zod.nativeEnum(LanguageType, {
    message: '不正な値が選択されています。',
  }),
})

export type AccountSchemaType = zod.infer<typeof AccountSchema>
