"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.share")}</h2>
        <div className="mt-2 flex items-center gap-2">
          <p className="flex-1 min-w-0 text-xs text-gray-500 break-all font-mono bg-gray-50/50 border border-gray-100 rounded-xl px-3 py-2">
            {publicUrl}
          </p>
          <button
            onClick={handleCopy}
            className="shrink-0 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            {copied ? t("qr.copied") : t("qr.copyLink")}
          </button>
        </div>
        <div className="mt-3">
          <QrShare url={publicUrl} />
        </div>
        <Link href={`/${username}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-accent hover:underline">
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
          <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-hover p-5 shadow-md shadow-[#FF6B35]/20">
            <div className="flex items-center gap-2 mb-3">
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
      </div>
    </div>
  );
}
