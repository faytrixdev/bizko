"use client";

import { PortfolioUpload } from "@/components/Upload";
import { PortfolioGrid } from "./PortfolioGrid";
import { useI18n } from "@/lib/i18n/provider";

interface PortfolioItem {
  id: string;
  media_url: string;
  media_type?: 'image' | 'video';
  thumbnail_url?: string | null;
  title: string | null;
  position: number;
}

interface TabPortfolioProps {
  portfolio: PortfolioItem[];
  profileId: string;
}

export function TabPortfolio({ portfolio, profileId }: TabPortfolioProps) {
  const { t } = useI18n();

  return (
    <div className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold font-display text-sm text-gray-900 uppercase tracking-wider text-xs">{t("dashboard.portfolioTitle")} ({portfolio.length}/9)</h2>
        {portfolio.length >= 9 ? (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
            {t("dashboard.portfolioFull")}
          </span>
        ) : (
          <PortfolioUpload profileId={profileId} />
        )}
      </div>
      {portfolio.length > 0 ? (
        <PortfolioGrid portfolio={portfolio} />
      ) : (
        <p className="text-xs text-gray-500 mt-3 text-center py-8">
          {t("dashboard.noImages")}
        </p>
      )}
    </div>
  );
}
