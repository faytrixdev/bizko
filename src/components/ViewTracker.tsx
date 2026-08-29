"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ViewTracker({ profileId }: { profileId: string }) {
  const tracked = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (tracked.current[profileId]) return;
    tracked.current[profileId] = true;

    const supabase = createClient();
    void supabase
      .rpc("record_event", { p_profile_id: profileId, p_type: "view" })
      .then(
        () => {},
        (err: unknown) => {
          console.error("view tracking failed:", err);
        }
      );
  }, [profileId]);

  return null;
}
