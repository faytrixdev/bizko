"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/admin/EmptyState";
import type { RetentionCohortRow } from "@/types/analytics";

export function RetentionContent() {
  const [cohorts, setCohorts] = useState<RetentionCohortRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_retention_cohorts").then(({ data, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("get_admin_retention_cohorts error:", error.message);
        setCohorts([]);
        setLoading(false);
        return;
      }
      const raw = data as {
        cohorts?: {
          cohort_week: string;
          size: number;
          retention?: { week_offset: number; retained: number; rate: number }[];
        }[];
      } | null;
      const rows: RetentionCohortRow[] = (raw?.cohorts ?? []).map((c) => {
        const retentionByWeek = new Map(
          (c.retention ?? []).map((r) => [r.week_offset, r.retained])
        );
        return {
          cohort_week: c.cohort_week,
          cohort_size: c.size,
          week1_retention: retentionByWeek.get(1) ?? null,
          week2_retention: retentionByWeek.get(2) ?? null,
          week3_retention: retentionByWeek.get(3) ?? null,
          week4_retention: retentionByWeek.get(4) ?? null,
        };
      });
      setCohorts(rows);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (cohorts.length === 0) return <EmptyState description="Les données de rétention apparaîtront ici une fois le tracking activé." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Rétention</h1>
        <p className="text-sm text-gray-500 mt-1">Rétention des utilisateurs par cohorte</p>
      </div>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Cohortes d&apos;inscription</h2>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
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
