"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CountryStat } from "@/types/analytics";

const COLORS = ["#111827", "#ff6b35", "#6366f1", "#25d366", "#eab308", "#ec4899", "#06b6d4", "#84cc16"];

export function AudienceContent() {
  const { start, end } = useAdminPeriod();
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_country_stats", { p_start: start, p_end: end }).then(({ data, error }) => {
      if (!cancelled) {
        if (error) {
          console.error("get_admin_country_stats error:", error.message);
        }
        const raw = data as { countries?: CountryStat[] } | null;
        setCountries(raw?.countries ?? []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (countries.length === 0) return <EmptyState description="Les données de localisation apparaîtront ici." />;

  const pieData = countries.slice(0, 8).map((c) => ({ name: c.country || "Inconnu", value: c.sessions }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Audience</h1>
        <p className="text-sm text-gray-500 mt-1">Localisation de ton audience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pays</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Détail par pays</h2>
          <div className="space-y-2">
            {countries.map((c) => (
              <div key={c.country} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{c.country || "Inconnu"}</span>
                <div className="flex gap-3">
                  <span className="text-xs text-gray-500">{c.sessions} sessions</span>
                  <span className="text-xs text-gray-500">{c.users} utilisateurs</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
