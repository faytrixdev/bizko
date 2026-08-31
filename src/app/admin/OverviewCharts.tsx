"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAdminPeriod } from "@/components/admin/PeriodSetter";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DailyStats } from "@/types/analytics";

export function OverviewCharts() {
  const { start, end } = useAdminPeriod();
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.rpc("get_admin_daily_stats", { p_start: start, p_end: end }).then(({ data: rows, error }) => {
      if (cancelled) return;
      if (error) {
        console.error("get_admin_daily_stats error:", error.message);
      }
      setData((rows as DailyStats[]) ?? []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [start, end]);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  if (data.length === 0) return <EmptyState title="Pas encore de données graphiques" />;

  const chartData = data.map((d) => ({
    ...d,
    label: format(new Date(d.day), "dd MMM", { locale: fr }),
  }));

  return (
    <div className="space-y-6">
      {/* Users chart */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 sm:mb-5">Utilisateurs actifs</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="active_users" name="Actifs" stroke="#111827" fill="url(#gradActive)" strokeWidth={2} />
            <Area type="monotone" dataKey="new_users" name="Nouveaux" stroke="#ff6b35" fill="url(#gradNew)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Sessions chart */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 sm:mb-5">Sessions</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradSession" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#6366f1" fill="url(#gradSession)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Engagement chart */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 sm:mb-5">Engagement</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradProfile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111827" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#111827" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradService" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradWhatsApp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#25d366" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#25d366" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="profile_views" name="Profils" stroke="#111827" fill="url(#gradProfile)" strokeWidth={2} />
            <Area type="monotone" dataKey="service_views" name="Services" stroke="#ff6b35" fill="url(#gradService)" strokeWidth={2} />
            <Area type="monotone" dataKey="whatsapp_clicks" name="WhatsApp" stroke="#25d366" fill="url(#gradWhatsApp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Signups chart */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 sm:mb-5">Inscriptions</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradSignup" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Area type="monotone" dataKey="signups" name="Inscriptions" stroke="#8b5cf6" fill="url(#gradSignup)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
