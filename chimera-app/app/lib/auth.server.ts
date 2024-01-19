import { Authenticator } from 'remix-auth'
import { Auth0Strategy } from 'remix-auth-auth0'
import { sessionStorage } from '~/lib/session.server'

export type User = {
  id?: string
  sub?: string
  name?: string
  email?: string
  picture?: string
  updated_at?: string
}

export const authenticator = new Authenticator<User>(sessionStorage)

const auth0Strategy = new Auth0Strategy(
  {
    callbackURL: process.env.AUTH0_CALLBACK_URL!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    domain: process.env.AUTH0_DOMAIN!,
  },
  // async ({ accessToken, refreshToken, extraParams, profile }) => {
  async ({ profile }) => {
    const auth0Profile = profile._json
    // Get the user data from your DB or API using the tokens and profile
    // return prisma.user.upsert({
    //   where: {
    //     email
    //   },
    //   create: {
    //     email,
    //     name: profile.displayName
    //   },
    //   update: {}
    // })
    return {
      sub: auth0Profile?.sub,
      name: auth0Profile?.name,
      email: auth0Profile?.email,
      picture: auth0Profile?.picture,
      update_at: auth0Profile?.updated_at,
    }
  },
)

authenticator.use(auth0Strategy)

export async function getUser(request: Request) {
  // ログインしてなければAuth0のログイン画面へリダイレクト
  // return await authenticator.authenticate('auth0', request)

  // ログインしてなければnullを返す
  return await authenticator.isAuthenticated(request)
}
