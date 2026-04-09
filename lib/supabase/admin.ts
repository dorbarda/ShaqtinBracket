import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Uses the service role key — bypasses RLS. Server-only, never import in client code.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
