"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import type { EventStat } from "@/types/analytics";

const EVENT_LABELS: Record<string, string> = {
  page_view: "Pages vues",
  session_start: "Sessions",
  user_signed_up: "Inscriptions",
  profile_completed: "Profil complété",
  service_created: "Service créé",
  profile_viewed: "Profil consulté",
  service_viewed: "Service consulté",
  whatsapp_clicked: "Clics WhatsApp",
  external_link_clicked: "Clics externes",
  profile_link_copied: "Lien copié",
  search_performed: "Recherches",
};

export function EventsContent() {
  const { start, end } = useAdminPeriod();
  const [events, setEvents] = useState<EventStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_events_list", { p_start: start, p_end: end }).then(({ data }) => {
      if (!cancelled) {
        setEvents((data as EventStat[]) ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (events.length === 0) return <EmptyState description="Les événements apparaîtront ici une fois le tracking activé." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Événements</h1>
        <p className="text-sm text-gray-500 mt-1">Tous les événements trackés sur Bizko</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Résumé des événements</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {events.map((e) => (
            <div key={e.event_name} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{EVENT_LABELS[e.event_name] || e.event_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">{e.event_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{e.total.toLocaleString("fr-FR")}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{e.unique_users.toLocaleString("fr-FR")} utilisateurs</span>
                    <span className="text-xs text-gray-500">{e.sessions.toLocaleString("fr-FR")} sessions</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
