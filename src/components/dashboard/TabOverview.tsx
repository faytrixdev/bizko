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
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.share")}</h2>
        <p className="text-xs text-gray-500 mt-2 break-all font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {publicUrl}
        </p>
        <div className="mt-3">
          <QrShare url={publicUrl} />
        </div>
        <Link href={`/${username}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-[#FF6B35] hover:underline">
          {t("dashboard.preview")}
        </Link>
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.analytics")}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold font-display text-gray-900">{views}</p>
            <p className="text-xs text-gray-500">{t("dashboard.views")}</p>
          </div>
          <div className="rounded-lg bg-gray-900 text-white p-4 text-center">
            <p className="text-2xl font-bold font-display">{waClicks}</p>
            <p className="text-xs text-gray-400">{t("dashboard.waClicks")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
