"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AcquisitionStats } from "@/types/analytics";

const COLORS = ["#111827", "#ff6b35", "#6366f1", "#25d366", "#eab308", "#ec4899", "#06b6d4", "#84cc16"];

export function AcquisitionContent() {
  const { start, end } = useAdminPeriod();
  const [stats, setStats] = useState<AcquisitionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_acquisition_stats", { p_start: start, p_end: end }).then(({ data }) => {
      if (!cancelled) {
        setStats(data as AcquisitionStats);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (!stats || !stats.by_source || stats.by_source.length === 0) return <EmptyState description="Les sources de trafic apparaîtront ici." />;

  const pieData = stats.by_source.map((s) => ({ name: s.source, value: s.sessions }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Acquisition</h1>
        <p className="text-sm text-gray-500 mt-1">D&apos;où viennent tes visiteurs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Sources de trafic</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Détail par source</h2>
          <div className="space-y-3">
            {stats.by_source.map((s) => (
              <div key={s.source} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900">{s.source}</span>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{s.sessions} sessions</span>
                    <span className="text-xs text-gray-500">{s.users} utilisateurs</span>
                    {s.signups > 0 && <span className="text-xs text-green-600">{s.signups} inscriptions</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {stats.utm_campaigns && stats.utm_campaigns.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Campagnes UTM</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Medium</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Campagne</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Sessions</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Utilisateurs</th>
                </tr>
              </thead>
              <tbody>
                {stats.utm_campaigns.map((c, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-2 text-gray-700">{c.utm_source}</td>
                    <td className="px-4 py-2 text-gray-700">{c.utm_medium || "—"}</td>
                    <td className="px-4 py-2 text-gray-700">{c.utm_campaign || "—"}</td>
                    <td className="px-4 py-2 text-right font-medium">{c.sessions}</td>
                    <td className="px-4 py-2 text-right font-medium">{c.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
