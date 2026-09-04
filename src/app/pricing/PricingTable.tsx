"use client";

import React from "react";
import { PLAN_COMPARISON, isUnlimited } from "@/lib/plans";
import { useI18n } from "@/lib/i18n/provider";

function Cell({ value }: { value: string }) {
  const { t } = useI18n();
  return (
    <span className="text-sm font-medium text-gray-900">
      {isUnlimited(value) ? t("pricing.unlimited") : value}
    </span>
  );
}

export function PricingTable() {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full border-collapse text-left" aria-label={t("pricing.compareTitle")}>
        <caption className="sr-only">{t("pricing.compareTitle")}</caption>
        <colgroup>
          <col className="w-[38%]" />
          <col className="w-[31%]" />
          <col className="w-[31%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="px-4 py-3 bg-gray-50/80" />
            <th scope="col" className="px-4 py-3 bg-gray-50/80 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t("pricing.colFree")}
            </th>
            <th scope="col" className="px-4 py-3 bg-violet-50 text-center border-b-2 border-violet-500">
              <span className="block text-xs font-semibold text-violet-700">{t("pricing.colPro")}</span>
              <span className="inline-block mt-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                {t("pricing.popular")}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {PLAN_COMPARISON.map((row) => (
            <tr key={row.labelKey}>
              <th scope="row" className="px-4 py-3.5 border-t border-gray-100 text-sm text-gray-600 font-normal">
                {t(row.labelKey)}
              </th>
              <td className="px-4 py-3.5 border-t border-gray-100 text-center">
                <Cell value={row.free} />
              </td>
              <td className="px-4 py-3.5 border-t border-gray-100 bg-violet-50/50 text-center">
                <Cell value={row.pro} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}