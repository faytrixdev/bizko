"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import type { RetentionCohortRow } from "@/types/analytics";

export function RetentionContent() {
  const { start, end } = useAdminPeriod();
  const [cohorts, setCohorts] = useState<RetentionCohortRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_retention_cohorts", { p_start: start, p_end: end }).then(({ data }) => {
      if (!cancelled) {
        setCohorts((data as RetentionCohortRow[]) ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (cohorts.length === 0) return <EmptyState description="Les données de rétention apparaîtront ici une fois le tracking activé." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Rétention</h1>
        <p className="text-sm text-gray-500 mt-1">Rétention des utilisateurs par cohorte</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-5 overflow-x-auto">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Cohortes d&apos;inscription</h2>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cohorte</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Utilisateurs</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Semaine 1</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Semaine 2</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Semaine 3</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Semaine 4</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.cohort_week} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700 font-mono text-xs">{c.cohort_week}</td>
                <td className="px-4 py-3 text-center font-medium">{c.cohort_size}</td>
                {[1, 2, 3, 4].map((w) => {
                  const val = w === 1 ? c.week1_retention : w === 2 ? c.week2_retention : w === 3 ? c.week3_retention : c.week4_retention;
                  const pct = c.cohort_size > 0 ? ((val ?? 0) / c.cohort_size * 100) : 0;
                  return (
                    <td key={w} className="px-4 py-3 text-center">
                      {val != null ? (
                        <span className="font-medium" style={{ color: pct > 50 ? "#16a34a" : pct > 25 ? "#eab308" : "#ef4444" }}>
                          {pct.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
