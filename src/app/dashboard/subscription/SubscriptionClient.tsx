"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { cancelSubscriptionAction, reactivateSubscriptionAction } from "./actions";
import {
  derivePlanInfo,
  subscriptionDisplay,
  type SubscriptionDisplay,
  type WhopMembership,
  type WhopPayment,
} from "@/lib/whop";

interface SubscriptionClientProps {
  isPro: boolean;
  membership: WhopMembership | null;
  payments: WhopPayment[];
  error: string | null;
  retryHref: string;
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const BADGE_STYLES: Record<SubscriptionDisplay, string> = {
  active: "bg-green-100 text-green-700",
  canceling: "bg-amber-100 text-amber-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-gray-100 text-gray-500",
};

const BADGE_KEYS: Record<SubscriptionDisplay, string> = {
  active: "subscription.badgeActive",
  canceling: "subscription.badgeCanceling",
  past_due: "subscription.badgePastDue",
  canceled: "subscription.badgeCanceled",
};

export function SubscriptionClient({
  isPro,
  membership,
  payments,
  error,
  retryHref,
}: SubscriptionClientProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const errorCode = searchParams.get("error");
  const successCode = searchParams.get("success");

  useEffect(() => {
    if (!showCancelModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCancelModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCancelModal]);

  let errorMsg: string | null = null;
  if (errorCode === "unavailable") errorMsg = t("subscription.errorUnavailable");
  else if (errorCode) errorMsg = t("subscription.errorGeneric");

  let successMsg: string | null = null;
  if (successCode === "canceled") successMsg = t("subscription.successCanceled");
  else if (successCode === "reactivated") successMsg = t("subscription.successReactivated");

  const display: SubscriptionDisplay | null = membership
    ? subscriptionDisplay(membership)
    : null;

  const planInfo = membership ? derivePlanInfo(membership.plan_id) : null;
  const periodKey =
    planInfo?.period === "yearly"
      ? t("subscription.periodYearly")
      : t("subscription.periodMonthly");

  const price =
    membership?.formatted_renewal_price ??
    (planInfo?.period === "yearly" ? "20 000 FCFA" : "2 500 FCFA");

  const endDate = formatDate(membership?.current_period_end, locale);
  const cancelDateBody = t("subscription.cancelBody").replace("{date}", endDate);

  function formatAmount(p: WhopPayment): string {
    if (p.total != null) {
      return new Intl.NumberFormat(locale).format(p.total) + " " + (p.currency ?? "FCFA");
    }
    return "—";
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[640px] mx-auto px-4 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          {t("subscription.back")}
        </Link>

        {errorMsg && (
          <p className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
            {errorMsg}
            {error === "unavailable" && (
              <Link href={retryHref} className="ml-2 underline font-medium">
                {t("subscription.retry")}
              </Link>
            )}
          </p>
        )}

        {successMsg && (
          <p className="mb-4 bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-sm">
            {successMsg}
          </p>
        )}

        <h1 className="text-xl font-bold text-gray-900 mb-6">
          {t("subscription.title")}
        </h1>

        {isPro && membership && display && (
          <div className="rounded-2xl border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${BADGE_STYLES[display]}`}
              >
                {t(BADGE_KEYS[display])}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {t("subscription.plan")}
                </p>
                <p className="text-sm text-gray-500">{periodKey}</p>
              </div>

              <div className="text-2xl font-bold text-gray-900">{price}</div>

              {display !== "canceled" && membership.current_period_end && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {t("subscription.nextBilling")}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">{endDate}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  {t("subscription.renews")}
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  {membership.cancel_at_period_end
                    ? t("subscription.renewsCancelled")
                    : t("subscription.renewsAuto")}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              {display === "active" && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold hover:bg-red-100 transition-colors"
                >
                  {t("subscription.cancelBtn")}
                </button>
              )}

              {display === "canceling" && (
                <form action={reactivateSubscriptionAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                  >
                    {t("subscription.reactivateBtn")}
                  </button>
                </form>
              )}

              {(display === "canceled" || display === "past_due") && (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  {t("subscription.subscribeBtn")}
                </Link>
              )}
            </div>
          </div>
        )}

        {!isPro && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 mb-6">
            <p className="text-sm font-semibold text-violet-900 mb-3">
              {t("subscription.upgradeBtn")}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              {t("subscription.upgradeBtn")}
            </Link>
          </div>
        )}

        {/* Payment history */}
        <div className="rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            {t("subscription.history")}
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-400">{t("subscription.historyEmpty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-2 font-medium">{t("subscription.colAmount")}</th>
                    <th className="pb-2 font-medium">{t("subscription.colDate")}</th>
                    <th className="pb-2 font-medium">{t("subscription.colStatus")}</th>
                    <th className="pb-2 font-medium">{t("subscription.colMethod")}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-gray-900 font-medium">{formatAmount(p)}</td>
                      <td className="py-2.5 text-gray-500">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString(locale, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.status === "succeeded" || p.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {p.status === "succeeded" || p.status === "paid"
                            ? t("subscription.paid")
                            : t("subscription.failed")}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {p.card_last4
                          ? t("subscription.card").replace("{last4}", p.card_last4)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-cancel-title"
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="subscription-cancel-title" className="text-lg font-bold text-gray-900 mb-2">
              {t("subscription.cancelTitle")}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{cancelDateBody}</p>
            <div className="flex flex-col gap-2">
              <form action={cancelSubscriptionAction}>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  {t("subscription.cancelConfirm")}
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full h-10 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                {t("subscription.cancelAbort")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
