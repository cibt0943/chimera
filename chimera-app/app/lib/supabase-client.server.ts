import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

// Create a single supabase client for interacting with your database
// Uses the service_role key to bypass RLS, since all DB access is server-side only
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
