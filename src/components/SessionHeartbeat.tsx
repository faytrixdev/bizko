"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function SessionHeartbeat() {
  useEffect(() => {
    const supabase = createClient();

    let cancelled = false;

    async function touch() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;
      if (cancelled) return;

      await supabase.auth.refreshSession();
    }

    // Refresh soon after mount so the token is re-armed right away, then
    // periodically to keep the session alive even while the tab is idle.
    touch();
    const interval = setInterval(touch, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return null;
}
