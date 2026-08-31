"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/admin/EmptyState";
import type { RealtimeStats } from "@/types/analytics";

export function RealtimeContent() {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchStats() {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_admin_realtime_stats");
      if (cancelled) return;
      if (error) {
        console.error("get_admin_realtime_stats error:", error.message);
      }
      setStats(data as RealtimeStats);
      setLoading(false);
    }

    function start() {
      if (interval) return;
      interval = setInterval(fetchStats, 30000);
    }
    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    fetchStats();
    start();

    // Pause the 30s polling while the tab is hidden to avoid useless
    // Supabase/DB work, and resume (with an immediate refresh) on visibility.
    function onVisibility() {
      if (document.hidden) {
        stop();
      } else if (!cancelled) {
        fetchStats();
        start();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  if (!stats || (stats.active_sessions === 0 && stats.active_users === 0)) {
    return <EmptyState title="Aucun utilisateur actif" description="Aucun visiteur en ce moment. Reviens dans quelques instants." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Temps réel</h1>
        <p className="text-sm text-gray-500 mt-1">Mise à jour toutes les 30 secondes</p>
      </div>

      {/* Active users */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-medium text-gray-500 mb-1">Sessions actives</p>
          <p className="text-4xl font-bold text-gray-900">{stats.active_sessions}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-medium text-gray-500 mb-1">Utilisateurs actifs</p>
          <p className="text-4xl font-bold text-gray-900">{stats.active_users}</p>
        </div>
      </div>

      {/* Pages being viewed */}
      {stats.pages && stats.pages.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pages consultées</h2>
          <div className="space-y-2">
            {stats.pages.map((p) => (
              <div key={p.page_path} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700 font-mono truncate">{p.page_path}</span>
                <span className="text-sm font-semibold text-gray-900 ml-4">{p.views}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent events */}
      {stats.recent_events && stats.recent_events.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Événements récents</h2>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {stats.recent_events.map((e, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 text-xs">
                <span className="font-mono text-gray-500">{new Date(e.created_at).toLocaleTimeString("fr-FR")}</span>
                <span className="font-medium text-gray-900">{e.event_name}</span>
                {e.page_path && <span className="text-gray-400 truncate">{e.page_path}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Devices & Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.devices && stats.devices.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Appareils</h2>
            {stats.devices.map((d) => (
              <div key={d.device_type} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 capitalize">{d.device_type}</span>
                <span className="text-sm font-semibold text-gray-900">{d.cnt}</span>
              </div>
            ))}
          </section>
        )}
        {stats.countries && stats.countries.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Pays</h2>
            {stats.countries.map((c) => (
              <div key={c.country} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{c.country}</span>
                <span className="text-sm font-semibold text-gray-900">{c.cnt}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
