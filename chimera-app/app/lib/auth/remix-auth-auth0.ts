import { Cookie, SetCookie, type SetCookieInit } from '@mjackson/headers'
import { Auth0, OAuth2RequestError, OAuth2Tokens, generateState } from 'arctic'
import { redirect } from 'react-router'
import { Strategy } from 'remix-auth/strategy'

type Auth0Scope = 'openid' | 'profile' | 'email' | string

type URLConstructor = ConstructorParameters<typeof URL>[0]

export class Auth0Strategy<U> extends Strategy<U, Auth0StrategyVerifyOptions> {
  name = 'auth0'

  protected client: Auth0

  constructor(
    protected options: Auth0StrategyOptions,
    verify: Strategy.VerifyFunction<U, Auth0StrategyVerifyOptions>,
  ) {
    super(verify)

    this.client = new Auth0(
      options.domain,
      options.clientId,
      options.clientSecret,
      options.redirectURI.toString(),
    )
  }

  private get cookieName() {
    if (typeof this.options.cookie === 'string') {
      return this.options.cookie || 'auth0'
    }
    return this.options.cookie?.name ?? 'auth0'
  }

  private get cookieOptions() {
    if (typeof this.options.cookie !== 'object') return {}
    return this.options.cookie ?? {}
  }

  override async authenticate(request: Request): Promise<U> {
    const url = new URL(request.url)

    const stateUrl = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      const description = url.searchParams.get('error_description')
      const uri = url.searchParams.get('error_uri')
      throw new OAuth2RequestError(error, description, uri, stateUrl)
    }

    if (!stateUrl) {
      const state = generateState()
      const url = this.client.createAuthorizationURL(
        state,
        null,
        this.options.scopes ?? ['openid', 'profile', 'email'],
      )

      url.search = this.authorizationParams(
        url.searchParams,
        request,
      ).toString()

      const header = new SetCookie({
        name: this.cookieName,
        value: new URLSearchParams({ state }).toString(),
        httpOnly: true, // Prevents JavaScript from accessing the cookie
        maxAge: 60 * 5, // 5 minutes
        path: '/', // Allow the cookie to be sent to any path
        sameSite: 'Lax', // Prevents it from being sent in cross-site requests
        ...this.cookieOptions,
      })

      throw redirect(url.toString(), {
        headers: { 'Set-Cookie': header.toString() },
      })
    }

    const code = url.searchParams.get('code')

    if (!code) throw new ReferenceError('Missing code in the URL')

    const cookie = new Cookie(request.headers.get('cookie') ?? '')
    const raw = cookie.get(this.cookieName) ?? ''
    const params = new URLSearchParams(raw)

    if (!params.has('state')) {
      throw new ReferenceError('Missing state on cookie.')
    }

    if (params.get('state') !== stateUrl) {
      throw new RangeError("State in URL doesn't match state in cookie.")
    }

    // Arctic's Auth0 client requires a code verifier when exchanging the
    // authorization code if PKCE was used. We stored only the `state` in the
    // cookie here, so we can't provide a verifier — pass `null` to match the
    // library signature which accepts `string | null`.
    const tokens = await this.client.validateAuthorizationCode(code, null)
    return await this.verify({ request, tokens })
  }

  /**
   * Get a new OAuth2 Tokens object using the refresh token once the previous
   * access token has expired.
   * @param refreshToken The refresh token to use to get a new access token
   * @returns The new OAuth2 tokens object
   * @example
   * ```ts
   * let tokens = await strategy.refreshToken(refreshToken);
   * console.log(tokens.accessToken());
   * ```
   */
  public refreshToken(refreshToken: string) {
    return this.client.refreshAccessToken(refreshToken)
  }

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * Some OAuth 2.0 providers allow additional, non-standard parameters to be
   * included when requesting authorization.  Since these parameters are not
   * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
   * strategies can override this function in order to populate these
   * parameters as required by the provider.
   */
  protected authorizationParams(
    params: URLSearchParams,
    _request: Request,
  ): URLSearchParams {
    return new URLSearchParams(params)
  }
}

/**
 * This interface declares what configuration the strategy needs from the
 * developer to correctly work.
 */
export interface Auth0StrategyOptions {
  domain: string
  /**
   * The name of the cookie used to keep state and code verifier around.
   *
   * The OAuth2 flow requires generating a random state and code verifier, and
   * then checking that the state matches when the user is redirected back to
   * the application. This is done to prevent CSRF attacks.
   *
   * The state and code verifier are stored in a cookie, and this option
   * allows you to customize the name of that cookie if needed.
   */
  cookie?: string | (Omit<SetCookieInit, 'value'> & { name: string })

  /**
   * This is the Client ID of your application, provided to you by the Identity
   * Provider you're using to authenticate users.
   */
  clientId: string
  /**
   * This is the Client Secret of your application, provided to you by the
   * Identity Provider you're using to authenticate users.
   */
  clientSecret: string

  /**
   * The URL of your application where the Identity Provider will redirect the
   * user after they've logged in or authorized your application.
   */
  redirectURI: URLConstructor

  /**
   * The scopes you want to request from the Identity Provider, this is a list
   * of strings that represent the permissions you want to request from the
   * user.
   */
  scopes?: Auth0Scope[]
}

/**
 * This interface declares what the developer will receive from the strategy
 * to verify the user identity in their system.
 */
export interface Auth0StrategyVerifyOptions {
  /** The request that triggered the verification flow */
  request: Request
  /** The OAuth2 tokens retrivied from the identity provider */
  tokens: OAuth2Tokens
}
