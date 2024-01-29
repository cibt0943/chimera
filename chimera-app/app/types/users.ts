export type UserModel = {
  id: number
  sub: string
  created_at: string
  updated_at: string
}

export type User = {
  id: number
  sub: string
  name: string
  email: string
  picture: string
  updated_at: string
}

export type Auth0User = {
  sub: string
  name: string
  email: string
  picture: string
  updated_at: string
}
