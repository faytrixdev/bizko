import { createBrowserClient } from "@supabase/ssr";
import { getAnalyticsSessionId } from "@/lib/analytics-session";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          "x-analytics-session": getAnalyticsSessionId(),
        },
      },
    }
  );
}