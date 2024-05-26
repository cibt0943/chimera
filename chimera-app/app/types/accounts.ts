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

export type Auth0Profile = {
  sub: string
  // nickname: string
  name: string
  email: string
  email_verified: boolean
  picture: string
  updated_at: string
}
