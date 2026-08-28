import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

// Server-only anon client for public (cached) reads. Unlike the SSR client it
// does not touch cookies(), so it is safe to use inside unstable_cache.
export function createPublicClient() {
  return createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}