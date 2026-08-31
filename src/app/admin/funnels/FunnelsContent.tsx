"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import type { FunnelStep } from "@/types/analytics";

export function FunnelsContent() {
  const { start, end } = useAdminPeriod();
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_funnel_stats", { p_start: start, p_end: end }).then(({ data, error }) => {
      if (!cancelled) {
        if (error) {
          console.error("get_admin_funnel_stats error:", error.message);
        }
        const raw = data as { steps?: FunnelStep[] } | null;
        setSteps(raw?.steps ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (steps.length === 0) return <EmptyState description="Les funnels apparaîtront ici une fois le tracking activé." />;

  const totalCount = steps[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Funnels</h1>
        <p className="text-sm text-gray-500 mt-1">Conversion de l&apos;audience au long du parcours</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Parcours de conversion</h2>
        <div className="space-y-1">
          {steps.map((step, i) => {
            const conversionRate = i === 0 ? 100 : ((step.count / totalCount) * 100);
            const prevCount = i > 0 ? (steps[i - 1]?.count ?? 0) : 0;
            const dropOff = i === 0 ? 0 : prevCount - step.count;
            const dropOffPct = i === 0 ? 0 : prevCount > 0 ? (dropOff / prevCount) * 100 : 0;

            return (
              <div key={step.name} className="flex items-center gap-4 py-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{step.name}</span>
                    {i > 0 && dropOff > 0 && (
                      <span className="text-xs text-red-500">-{dropOff.toLocaleString("fr-FR")} ({dropOffPct.toFixed(1)}%)</span>
                    )}
                  </div>
                  <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${Math.max(conversionRate, 2)}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <span className="text-sm font-bold text-gray-900">{step.count.toLocaleString("fr-FR")}</span>
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
