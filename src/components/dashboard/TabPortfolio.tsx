"use client";

import { deletePortfolio } from "@/app/dashboard/actions";
import { PortfolioUpload } from "@/components/Upload";
import { useI18n } from "@/lib/i18n/provider";

interface PortfolioItem {
  id: string;
  image_url: string;
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
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold font-display text-sm text-gray-900">{t("dashboard.portfolioTitle")} ({portfolio.length}/9)</h2>
        {portfolio.length >= 9 ? (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
            {t("dashboard.portfolioFull")}
          </span>
        ) : (
          <PortfolioUpload profileId={profileId} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {portfolio.map((p) => (
          <div key={p.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="aspect-square object-cover rounded-lg border border-gray-200" />
            <form action={deletePortfolio} className="absolute top-1 right-1">
              <input type="hidden" name="id" value={p.id} />
              <button className="bg-white/90 backdrop-blur text-xs w-6 h-6 rounded-lg border border-gray-200 hover:bg-white">
                x
              </button>
            </form>
          </div>
        ))}
      </div>
      {portfolio.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center py-8">
          {t("dashboard.noImages")}
        </p>
      )}
    </div>
  );
}
