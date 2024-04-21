import { Authenticator } from 'remix-auth'
import { Auth0Strategy } from 'remix-auth-auth0'
import { sessionStorage } from '~/lib/session.server'
import { getOrInsertAccount } from '~/models/account.server'
import { Account, Auth0Profile } from '~/types/accounts'

export const authenticator = new Authenticator<Account>(sessionStorage)

const auth0Strategy = new Auth0Strategy<Account>(
  {
    callbackURL: process.env.AUTH0_CALLBACK_URL!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    domain: process.env.AUTH0_DOMAIN!,
  },
  // async ({ accessToken, refreshToken, extraParams, profile }) => {
  async ({ profile }) => {
    const auth0Profile = profile._json as Auth0Profile
    const account = await getOrInsertAccount({ sub: auth0Profile.sub })
    return {
      id: account.id,
      sub: account.sub,
      name: auth0Profile.name,
      email: auth0Profile.email,
      picture: auth0Profile.picture,
      created_at: account.created_at,
      updated_at: account.updated_at,
    }
  },
)

authenticator.use(auth0Strategy)
