import { Authenticator } from 'remix-auth'
import { Auth0Strategy } from 'remix-auth-auth0'
import { sessionStorage } from '~/lib/session.server'
import { getOrInsertAccount } from '~/models/account.server'
import { Auth0User, LoginSession } from '~/types/accounts'

export const authenticator = new Authenticator<LoginSession>(sessionStorage)

const auth0Strategy = new Auth0Strategy<LoginSession>(
  {
    callbackURL: process.env.AUTH0_CALLBACK_URL!,
    clientID: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    domain: process.env.AUTH0_DOMAIN!,
  },
  // アカウント情報の取得
  // async ({ accessToken, refreshToken, extraParams, profile }) => {
  async ({ profile }) => {
    const auth0User = profile._json as Auth0User

    // DBからアカウント情報を取得または作成
    const account = await getOrInsertAccount({ sub: auth0User.sub })

    // Auth0Userの情報とDBにて独自に管理しているアカウント情報を返す(=セッションに保存される)
    return { auth0User, account }
  },
)

authenticator.use(auth0Strategy)
