"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ViewTracker({ profileId }: { profileId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const supabase = createClient();
    supabase
      .rpc("record_event", { p_profile_id: profileId, p_type: "view" })
      .then(() => {});
  }, [profileId]);

  return null;
}