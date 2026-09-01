"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ServiceViewTracker({ serviceIds }: { serviceIds: string[] }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const supabase = createClient();
    void supabase.rpc("track_analytics_event", {
      p_event_name: "service_viewed",
      p_page_path: window.location.pathname,
      p_metadata: JSON.stringify({ service_ids: serviceIds }),
    });
  }, [serviceIds]);

  return null;
}
