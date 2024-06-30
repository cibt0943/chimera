import { Authenticator } from 'remix-auth'
import { Auth0Strategy } from 'remix-auth-auth0'
import { sessionStorage } from '~/lib/session.server'
import { getOrInsertAccount } from '~/models/account.server'
import {
  Account,
  Auth0User,
  Auth0UserAndAccountModel2Account,
} from '~/types/accounts'

export const authenticator = new Authenticator<Account>(sessionStorage)

const auth0Strategy = new Auth0Strategy<Account>(
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
    const accountModel = await getOrInsertAccount({ sub: auth0User.sub })

    // アカウント情報を返す
    return Auth0UserAndAccountModel2Account(auth0User, accountModel)
  },
)

authenticator.use(auth0Strategy)
