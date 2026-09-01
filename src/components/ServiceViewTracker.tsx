"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function ServiceViewTracker({ serviceIds }: { serviceIds: string[] }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    console.log("[ServiceViewTracker] tracking service_viewed for", serviceIds);

    const supabase = createClient();
    void supabase
      .rpc("track_analytics_event", {
        p_event_name: "service_viewed",
        p_page_path: window.location.pathname,
        p_metadata: JSON.stringify({ service_ids: serviceIds }),
      })
      .then(({ error }) => {
        if (error) {
          console.error("[ServiceViewTracker] service_viewed failed:", error.message);
        }
      });
  }, [serviceIds]);

  return null;
}
