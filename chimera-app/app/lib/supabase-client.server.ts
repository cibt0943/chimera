import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

// Service-role client: bypasses RLS. Use only for account management operations
// (e.g. looking up or creating accounts before a user session is established).
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// Sign a HS256 JWT using the Supabase JWT secret.
function signJwt(payload: Record<string, unknown>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const body = Buffer.from(JSON.stringify(payload))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  const signingInput = `${header}.${body}`
  const sig = createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `${signingInput}.${sig}`
}

// Create a per-user Supabase client whose JWT carries the user's account UUID as
// the `sub` claim with role = 'authenticated'. RLS policies compare auth.uid()
// against account_id columns, so this client is restricted to the user's own rows.
export function createSupabaseClientForUser(
  accountId: string,
): ReturnType<typeof createClient<Database>> {
  const now = Math.floor(Date.now() / 1000)
  const jwt = signJwt(
    {
      sub: accountId,
      role: 'authenticated',
      iat: now,
      exp: now + 3600,
    },
    process.env.SUPABASE_JWT_SECRET!,
  )
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    },
  )
}
