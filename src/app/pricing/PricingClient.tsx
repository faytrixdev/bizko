"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { PricingTable } from "./PricingTable";
import { startSubscription } from "@/app/dashboard/actions";

export type PricingCtaState = "guest" | "free" | "pro";

interface PricingClientProps {
  ctaState: PricingCtaState;
}

export function PricingClient({ ctaState }: PricingClientProps) {
  const { t } = useI18n();

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
      {/* Hero */}
      <section className="pt-28 pb-10 text-center sm:pt-36">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-gray-900">
          {t("pricing.title")}
        </h1>
        <p className="mt-4 text-gray-500 leading-7 max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
        {ctaState === "guest" && (
          <Link
            href="/signup?next=/pricing"
            className="mt-8 inline-flex items-center justify-center h-12 rounded-xl bg-accent px-8 text-sm font-semibold text-white hover:bg-accent-hover transition-all duration-200 shadow-md shadow-[#FF6B35]/25"
          >
            {t("pricing.guestCta")}
          </Link>
        )}
      </section>

      {/* Compare */}
      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{t("pricing.compareTitle")}</h2>
        <PricingTable />
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 text-center mb-8">{t("pricing.cardsTitle")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Monthly */}
          <div className="rounded-2xl border border-gray-200 p-6 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">{t("pricing.cardMonthlyLabel")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{t("pricing.cardMonthlyPrice")}</p>
            {ctaState === "free" ? (
              <form action={startSubscription} className="mt-6">
                <input type="hidden" name="interval" value="monthly" />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
                >
                  {t("pricing.cardMonthlyCta")}
                </button>
              </form>
            ) : ctaState === "guest" ? (
              <Link
                href="/signup?next=/pricing"
                className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
              >
                {t("pricing.cardMonthlyCta")}
              </Link>
            ) : (
              <Link
                href="/dashboard/subscription"
                className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl border border-violet-300 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-100 transition-colors"
              >
                {t("pricing.manageCta")}
              </Link>
            )}
          </div>

          {/* Yearly */}
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-50/40 p-6 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">{t("pricing.cardYearlyLabel")}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{t("pricing.cardYearlyPrice")}</p>
            {ctaState === "free" ? (
              <form action={startSubscription} className="mt-6">
                <input type="hidden" name="interval" value="yearly" />
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  {t("pricing.cardYearlyCta")}
                </button>
              </form>
            ) : ctaState === "guest" ? (
              <Link
                href="/signup?next=/pricing"
                className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                {t("pricing.cardYearlyCta")}
              </Link>
            ) : (
              <Link
                href="/dashboard/subscription"
                className="mt-6 inline-flex items-center justify-center w-full h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                {t("pricing.manageCta")}
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}