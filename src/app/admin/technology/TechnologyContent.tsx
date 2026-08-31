"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import type { DeviceStat } from "@/types/analytics";

export function TechnologyContent() {
  const { start, end } = useAdminPeriod();
  const [stats, setStats] = useState<DeviceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_device_stats", { p_start: start, p_end: end }).then(({ data, error }) => {
      if (!cancelled) {
        if (error) {
          console.error("get_admin_device_stats error:", error.message);
        }
        const raw = data as {
          devices?: { device_type: string; cnt: number }[];
          browsers?: { browser: string; cnt: number }[];
          os_list?: { os: string; cnt: number }[];
        } | null;
        if (!raw) { setStats([]); setLoading(false); return; }

        const all: DeviceStat[] = [];
        const totalSessions = [
          ...(raw.devices ?? []),
          ...(raw.browsers ?? []),
          ...(raw.os_list ?? []),
        ].reduce((sum, item) => sum + (item.cnt ?? 0), 0) || 1;

        for (const d of raw.devices ?? []) {
          all.push({ dimension: "device_type", value: d.device_type, sessions: d.cnt, percentage: (d.cnt / totalSessions) * 100 });
        }
        for (const b of raw.browsers ?? []) {
          all.push({ dimension: "browser", value: b.browser, sessions: b.cnt, percentage: (b.cnt / totalSessions) * 100 });
        }
        for (const o of raw.os_list ?? []) {
          all.push({ dimension: "os", value: o.os, sessions: o.cnt, percentage: (o.cnt / totalSessions) * 100 });
        }
        setStats(all);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (stats.length === 0) return <EmptyState description="Les données techniques apparaîtront ici." />;

  const byDevice = stats.filter((s) => s.dimension === "device_type");
  const byBrowser = stats.filter((s) => s.dimension === "browser");
  const byOS = stats.filter((s) => s.dimension === "os");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Technologie</h1>
        <p className="text-sm text-gray-500 mt-1">Appareils, navigateurs et systèmes d&apos;exploitation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {byDevice.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Appareils</h2>
            {byDevice.map((d) => (
              <div key={d.value} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700 capitalize">{d.value}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{d.sessions.toLocaleString("fr-FR")}</span>
                  <span className="text-xs text-gray-400">{d.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {byBrowser.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Navigateurs</h2>
            {byBrowser.map((d) => (
              <div key={d.value} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{d.value}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{d.sessions.toLocaleString("fr-FR")}</span>
                  <span className="text-xs text-gray-400">{d.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {byOS.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">OS</h2>
            {byOS.map((d) => (
              <div key={d.value} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{d.value}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{d.sessions.toLocaleString("fr-FR")}</span>
                  <span className="text-xs text-gray-400">{d.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
