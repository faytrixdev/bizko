"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import type { FunnelData } from "@/types/analytics";

const FUNNEL_LABELS: Record<string, string> = {
  landing: "Landing page",
  page_view: "Page vue",
  profile_viewed: "Profil consulté",
  service_viewed: "Service consulté",
  whatsapp_clicked: "Clic WhatsApp",
};

const FUNNEL_ORDER = ["landing", "page_view", "profile_viewed", "service_viewed", "whatsapp_clicked"];

export function FunnelsContent() {
  const { start, end } = useAdminPeriod();
  const [funnels, setFunnels] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_funnel_stats", { p_start: start, p_end: end }).then(({ data }) => {
      if (!cancelled) {
        setFunnels((data as FunnelData[]) ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (funnels.length === 0) return <EmptyState description="Les funnels apparaîtront ici une fois le tracking activé." />;

  const sortedSteps = FUNNEL_ORDER.filter((s) => funnels.some((f) => f.step_name === s));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Funnels</h1>
        <p className="text-sm text-gray-500 mt-1">Conversion de l&apos;audience au long du parcours</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Parcours de conversion</h2>
        <div className="space-y-1">
          {sortedSteps.map((stepName, i) => {
            const funnel = funnels.find((f) => f.step_name === stepName);
            if (!funnel) return null;
            const conversionRate = i === 0 ? 100 : ((funnel.unique_users / (funnels.find((f) => f.step_name === sortedSteps[0])?.unique_users ?? 1)) * 100);
            const dropOff = i === 0 ? null : ((funnels.find((f) => f.step_name === sortedSteps[i - 1])?.unique_users ?? 0) - funnel.unique_users);
            const dropOffPct = i === 0 ? null : (dropOff ? ((dropOff / (funnels.find((f) => f.step_name === sortedSteps[i - 1])?.unique_users ?? 1)) * 100) : 0);

            return (
              <div key={stepName} className="flex items-center gap-4 py-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{FUNNEL_LABELS[stepName] || stepName}</span>
                    {i > 0 && dropOff !== null && dropOffPct !== null && (
                      <span className="text-xs text-red-500">-{dropOff.toLocaleString("fr-FR")} ({dropOffPct.toFixed(1)}%)</span>
                    )}
                  </div>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${Math.max(conversionRate, 2)}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <span className="text-sm font-bold text-gray-900">{funnel.unique_users.toLocaleString("fr-FR")}</span>
                  <span className="text-xs text-gray-400 ml-1">{conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
