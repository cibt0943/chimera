import { Authenticator } from 'remix-auth'
import { OAuth2Tokens } from 'arctic'
import { Auth0Strategy } from './remix-auth-auth0'
import { getOrInsertAccount } from '~/models/account.server'
import { Auth0User, LoginInfo } from '~/types/accounts'

const Auth0StrategyOptions = {
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  domain: process.env.AUTH0_DOMAIN!,
  redirectURI: process.env.AUTH0_CALLBACK_URL!,
}

async function getUser(tokens: OAuth2Tokens, request: Request) {
  const userInfoURL = `https://${Auth0StrategyOptions.domain}/userinfo`
  const accessToken = tokens.accessToken()

  const response = await fetch(userInfoURL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const auth0User = (await response.json()) as Auth0User

  // DBからアカウント情報を取得または作成
  const account = await getOrInsertAccount({ sub: auth0User.sub })

  // Auth0Userの情報とDBにて独自に管理しているアカウント情報を返す
  return { auth0User, account }
}

export const authenticator = new Authenticator<LoginInfo>()

const auth0Strategy = new Auth0Strategy<LoginInfo>(
  Auth0StrategyOptions,
  async ({ tokens, request }) => {
    return await getUser(tokens, request)
  },
)

authenticator.use(auth0Strategy, 'auth0')
