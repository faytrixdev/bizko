"use client";

import Link from "next/link";
import { QrShare } from "@/components/QrShare";
import { useI18n } from "@/lib/i18n/provider";

interface TabOverviewProps {
  publicUrl: string;
  username: string;
  views: number;
  waClicks: number;
}

export function TabOverview({ publicUrl, username, views, waClicks }: TabOverviewProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.share")}</h2>
        <p className="text-xs text-gray-500 mt-2 break-all font-mono bg-gray-50/50 border border-gray-100 rounded-xl px-3 py-2">
          {publicUrl}
        </p>
        <div className="mt-3">
          <QrShare url={publicUrl} />
        </div>
        <Link href={`/${username}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-[#FF6B35] hover:underline">
          {t("dashboard.preview")}
        </Link>
      </div>

      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.analytics")}</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Views card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
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

          {/* WhatsApp clicks card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#EA580C] p-5 shadow-md shadow-[#FF6B35]/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">{t("dashboard.waClicks")}</p>
            </div>
            <p className="text-3xl font-bold font-display text-white">{waClicks}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
