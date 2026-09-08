"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";

const DISMISS_KEY = "bizko_switch_reminder_dismissed";

interface SwitchReminderProps {
  pendingInterval: "monthly" | "yearly" | null;
  graceActive: boolean;
  graceEnd: string | null;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Deferred switch: when the old plan lapsed and the 7-day grace window is
 * running, show a persistent banner above the header plus a one-time popup
 * (per session) reminding the member to complete the new plan's checkout.
 */
export function SwitchReminder({ pendingInterval, graceActive, graceEnd }: SwitchReminderProps) {
  const { t, locale } = useI18n();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!graceActive || !pendingInterval) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    sessionStorage.setItem(DISMISS_KEY, "1");
    const id = window.setTimeout(() => setShowPopup(true), 0);
    return () => window.clearTimeout(id);
  }, [graceActive, pendingInterval]);

  if (!graceActive || !pendingInterval) return null;

  const target =
    pendingInterval === "yearly" ? t("subscription.targetYearly") : t("subscription.targetMonthly");
  const date = graceEnd ? formatDate(graceEnd, locale) : t("subscription.periodEnd");

  return (
    <>
      <div className="bg-amber-100 border-b border-amber-200">
        <div className="max-w-[640px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-amber-900 font-semibold">
            {t("reminder.bannerTitle").replace("{target}", target)}{" "}
            <span className="font-normal text-amber-800">
              {t("reminder.bannerBody").replace("{date}", date)}
            </span>
          </p>
          <Link
            href="/dashboard/subscription"
            className="shrink-0 inline-flex items-center justify-center h-7 px-3 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
          >
            {t("reminder.cta")}
          </Link>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t("reminder.popupTitle").replace("{target}", target)}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {t("reminder.popupBody").replace("{date}", date)}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="flex-1 inline-flex items-center justify-center h-9 px-5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {t("reminder.later")}
              </button>
              <Link
                href="/dashboard/subscription"
                onClick={() => setShowPopup(false)}
                className="flex-1 inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                {t("reminder.popupCta")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}