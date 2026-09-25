import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only admin client using the service role key. NEVER import this
// into client components or expose it to the browser. `server-only` fait
// échouer le build si ce module est importé depuis un composant client.
export function createAdminClient() {
  // Garde-fou : `SUPABASE_SERVICE_ROLE_KEY` n'est jamais injectée dans un
  // bundle navigateur (seuls les NEXT_PUBLIC_* le sont), ce qui laisserait un
  // client silencieusement inutilisable. On échoue explicitement si ce module
  // est évalué côté client.
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() must never be used in the browser (server-only module)."
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

