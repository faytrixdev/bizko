"use client";

import Link from "next/link";
import { QrShare } from "@/components/QrShare";
import { useI18n } from "@/lib/i18n/provider";
import type { DailyEvent, ClickBucket } from "@/types/analytics";

interface TabOverviewProps {
  publicUrl: string;
  username: string;
  views: number;
  waClicks: number;
  daily: DailyEvent[];
  breakdown: ClickBucket[];
  views7d: number;
  clicks7d: number;
}

const BUCKET_KEYS: Record<string, string> = {
  main: "dashboard.bucketMain",
  sticky: "dashboard.bucketSticky",
  floating: "dashboard.bucketFloating",
  service: "dashboard.bucketService",
  tel: "dashboard.bucketTel",
  other: "dashboard.bucketOther",
};

export function TabOverview({ publicUrl, username, views, waClicks, daily, breakdown, views7d, clicks7d }: TabOverviewProps) {
  const { t } = useI18n();

  const conversion = views7d > 0 ? Math.round((clicks7d / views7d) * 100) : 0;
  const maxViews = Math.max(...daily.map((d) => d.views), 1);
  const maxClicks = Math.max(...daily.map((d) => d.clicks), 1);
  const totalClicks7d = breakdown.reduce((sum, b) => sum + b.count, 0);

  const dayLabel = (day: string) =>
    new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { weekday: "short" });

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.share")}</h2>
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 min-w-0 text-xs text-gray-500 break-all font-mono bg-gray-50/50 border border-gray-100 rounded-xl px-3 py-2">
            {publicUrl}
          </p>
        </div>
        <div className="mt-3">
          <QrShare url={publicUrl} />
        </div>
        <Link href={`/${username}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-accent hover:underline">
          {t("dashboard.preview")}
        </Link>
      </div>

      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.analytics")}</h2>
        </div>

        {/* Lifetime totals */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dashboard.views")}</p>
            </div>
            <p className="text-3xl font-bold font-display text-gray-900">{views}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-hover p-5 shadow-md shadow-[#FF6B35]/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider leading-tight">{t("dashboard.waClicks")}</p>
            </div>
            <p className="text-3xl font-bold font-display text-white">{waClicks}</p>
          </div>
        </div>

        {/* Last 7 days */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dashboard.trendTitle")}</p>
            <span className="text-[11px] font-medium text-gray-400">{t("dashboard.last7Days")}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dashboard.views")}</p>
              <p className="text-2xl font-bold font-display text-gray-900 mt-2">{views7d}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t("dashboard.waClicks")}</p>
              <p className="text-2xl font-bold font-display text-gray-900 mt-2">{clicks7d}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-hover p-4 shadow-md shadow-[#FF6B35]/20">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{t("dashboard.conversion")}</p>
              <p className="text-2xl font-bold font-display text-white mt-2">{conversion}%</p>
              <p className="text-[10px] text-white/60 mt-1">{t("dashboard.conversionSub")}</p>
            </div>
          </div>

          {/* 7-day trend chart */}
          <div className="mt-6">
            <div className="flex items-end gap-1.5 h-28">
              {daily.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex items-end justify-center gap-0.5">
                    <div
                      className="w-2 rounded-t-sm bg-accent/80"
                      style={{ height: `${Math.max((d.views / maxViews) * 100, 2)}px` }}
                      title={`${dayLabel(d.day)} - ${d.views}`}
                    />
                    <div
                      className="w-2 rounded-t-sm bg-gray-300"
                      style={{ height: `${Math.max((d.clicks / maxClicks) * 100, 2)}px` }}
                      title={`${dayLabel(d.day)} - ${d.clicks}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1.5">{dayLabel(d.day)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-accent/80" />{t("dashboard.views")}</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300" />{t("dashboard.waClicks")}</span>
            </div>
          </div>

          {/* Click breakdown */}
          {breakdown.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{t("dashboard.clicksBreakdown")}</p>
              <div className="flex flex-col gap-2">
                {breakdown.map((b) => {
                  const pct = totalClicks7d > 0 ? Math.round((b.count / totalClicks7d) * 100) : 0;
                  return (
                    <div key={b.bucket} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-gray-600 truncate">{t(BUCKET_KEYS[b.bucket] ?? "dashboard.bucketOther")}</span>
                      <div className="flex-1 h-6 rounded-lg bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-lg bg-accent/80" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-gray-900">{b.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
