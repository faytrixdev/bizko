"use client";

import { useEffect, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function ViewTracker({ profileId }: { profileId: string }) {
  const tracked = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (tracked.current[profileId]) return;
    tracked.current[profileId] = true;

    console.log("[ViewTracker] tracking profile_viewed for", profileId);

    // Compteur de vues legacy : via une route serveur. `record_event` n'est
    // plus exécutable avec la clé anon (migration 20260923000005) : l'appel
    // direct permettait de gonfler les compteurs sans limite.
    void fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    }).catch(() => {
      // Suivi non bloquant : une erreur réseau ne doit rien casser.
    });

    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    // Analytics platform tracking
    void supabase
      .rpc("track_analytics_event", {
        p_event_name: "profile_viewed",
        p_page_path: window.location.pathname,
        p_metadata: JSON.stringify({ profile_id: profileId }),
      })
      .then(({ error }) => {
        if (error) {
          console.error("[ViewTracker] profile_viewed failed:", error.message);
        }
      });
  }, [profileId]);

  return null;
}
