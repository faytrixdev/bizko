"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { KPICard } from "@/components/admin/KPICard";
import { EmptyState } from "@/components/admin/EmptyState";
import { OverviewCharts } from "./OverviewCharts";
import type { OverviewKPIs } from "@/types/analytics";

export function OverviewContent() {
  const { start, end, prevStart, prevEnd } = useAdminPeriod();
  const [kpis, setKpis] = useState<OverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_admin_overview_kpis", {
      p_start: start,
      p_end: end,
      p_prev_start: prevStart,
      p_prev_end: prevEnd,
    }).then(({ data }) => {
      setKpis(data as OverviewKPIs);
      setLoading(false);
    });
  }, [start, end, prevStart, prevEnd]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  if (!kpis) return <EmptyState />;

  const hasData = kpis.sessions.current > 0 || kpis.active_users.current > 0;

  if (!hasData) return <EmptyState description="Commence à tracker des événements pour voir les données ici." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Vue d&apos;ensemble de l&apos;activité Bizko</p>
      </div>

      {/* Users section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Utilisateurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Utilisateurs actifs" value={kpis.active_users.current} previous={kpis.active_users.previous} />
          <KPICard label="Nouveaux utilisateurs" value={kpis.new_users.current} previous={kpis.new_users.previous} />
          <KPICard label="Utilisateurs récurrents" value={kpis.returning_users.current} previous={kpis.returning_users.previous} />
        </div>
      </section>

      {/* Traffic section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Trafic</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Sessions" value={kpis.sessions.current} previous={kpis.sessions.previous} />
          <KPICard label="Vues de pages" value={kpis.page_views.current} previous={kpis.page_views.previous} />
        </div>
      </section>

      {/* Engagement section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Engagement Bizko</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="Profils consultés" value={kpis.profile_views.current} previous={kpis.profile_views.previous} />
          <KPICard label="Services consultés" value={kpis.service_views.current} previous={kpis.service_views.previous} />
          <KPICard label="Clics WhatsApp" value={kpis.whatsapp_clicks.current} previous={kpis.whatsapp_clicks.previous} />
          <KPICard label="Clics externes" value={kpis.external_clicks.current} previous={kpis.external_clicks.previous} />
        </div>
      </section>

      {/* Conversion section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Conversion</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPICard label="Inscriptions" value={kpis.signups.current} previous={kpis.signups.previous} />
          <KPICard label="Profils complétés" value={kpis.profile_completed.current} previous={kpis.profile_completed.previous} />
          <KPICard label="Services créés" value={kpis.services_created.current} previous={kpis.services_created.previous} />
        </div>
      </section>

      {/* Charts */}
      <OverviewCharts />
    </div>
  );
}
