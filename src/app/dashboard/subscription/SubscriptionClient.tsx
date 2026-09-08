"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { useCleanUrl } from "@/lib/hooks";
import { changeSubscription, cancelPendingSwitch, finalizePendingSwitch } from "@/app/dashboard/actions";
import { derivePlanInfo, subscriptionDisplay, type SubscriptionDisplay, type WhopMembership, type WhopPayment } from "@/lib/whop";
import { SWITCH_GRACE_DAYS } from "@/lib/plans";
import { SwitchReminder } from "@/components/SwitchReminder";

interface SubscriptionClientProps {
  isPro: boolean;
  missingMembership: boolean;
  membership: WhopMembership | null;
  payments: WhopPayment[];
  error: string | null;
  yearlyAvailable: boolean;
  retryHref: string;
  pendingInterval: string | null;
  pendingEffectiveAt: string | null;
  graceActive: boolean;
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
  missingMembership,
  membership,
  payments,
  error,
  yearlyAvailable,
  retryHref,
  pendingInterval,
  pendingEffectiveAt,
  graceActive,
}: SubscriptionClientProps) {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();
  const [confirmTarget, setConfirmTarget] = useState<"monthly" | "yearly" | null>(null);

  const errorCode = searchParams.get("error");
  const successCode = searchParams.get("success");
  useCleanUrl();

  let errorMsg: string | null = null;
  if (errorCode === "unavailable") errorMsg = t("subscription.errorUnavailable");
  else if (errorCode === "switch_failed") errorMsg = t("subscription.errorSwitch");
  else if (errorCode === "switch_cancel_failed") errorMsg = t("subscription.errorSwitchCancel");
  else if (errorCode) errorMsg = t("subscription.errorGeneric");

  const successMsg =
    successCode === "plan_changed" ? t("subscription.changeSuccess")
      : successCode === "switch_scheduled" ? t("subscription.switchScheduled")
        : successCode === "switch_cancelled" ? t("subscription.switchCancelled")
          : null;

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
    t(planInfo?.period === "yearly" ? "pricing.yearlyAmount" : "pricing.monthlyAmount");

  const endDate = formatDate(membership?.current_period_end, locale);
  const pendingDate = formatDate(pendingEffectiveAt, locale);

  const graceEnd = pendingEffectiveAt
    ? new Date(new Date(pendingEffectiveAt).getTime() + SWITCH_GRACE_DAYS * 86_400_000).toISOString()
    : null;

  const switchTargetWord = () =>
    confirmTarget === "yearly" ? t("subscription.targetYearly") : t("subscription.targetMonthly");

  function formatAmount(p: WhopPayment): string {
    if (p.total != null) {
      return new Intl.NumberFormat(locale).format(p.total) + " " + (p.currency ?? "FCFA");
    }
    return "—";
  }

  return (
    <div className="min-h-screen bg-white">
      <SwitchReminder
        pendingInterval={
          pendingInterval === "monthly" || pendingInterval === "yearly" ? pendingInterval : null
        }
        graceActive={graceActive}
        graceEnd={graceEnd}
      />
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
              {(display === "active" || display === "canceling") && membership.manage_url && (
                <Link
                  href={membership.manage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  {t("subscription.manage")}
                </Link>
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

        {missingMembership && (
          <div className="rounded-2xl border border-gray-200 p-5 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("subscription.plan")}
            </p>
            <p className="text-sm text-gray-500">{t("subscription.noMembership")}</p>
          </div>
        )}

        {/* Scheduled deferred switch: current period still running */}
        {pendingInterval && !graceActive && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("subscription.switchScheduledTitle")}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {t("subscription.switchScheduledBody")
                .replace("{target}", pendingInterval === "yearly" ? t("subscription.targetYearly") : t("subscription.targetMonthly"))
                .replace("{date}", pendingDate || t("subscription.periodEnd"))}
            </p>
            <form action={cancelPendingSwitch}>
              <button
                type="submit"
                className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-amber-300 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
              >
                {t("subscription.cancelSwitchCta")}
              </button>
            </form>
          </div>
        )}

        {/* Grace window: old period ended, awaits the new checkout */}
        {pendingInterval && graceActive && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("subscription.switchGraceTitle")}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {t("subscription.switchGraceBody")
                .replace("{target}", pendingInterval === "yearly" ? t("subscription.targetYearly") : t("subscription.targetMonthly"))
                .replace("{date}", pendingDate || t("subscription.periodEnd"))}
            </p>
            <div className="flex flex-wrap gap-3">
              <form action={finalizePendingSwitch}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                >
                  {t("subscription.finalizeCta")}
                </button>
              </form>
              <form action={cancelPendingSwitch}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-amber-300 text-amber-800 text-sm font-semibold hover:bg-amber-100 transition-colors"
                >
                  {t("subscription.cancelSwitchCta")}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Change plan card (only when no switch is pending) */}
        {isPro && membership && !pendingInterval && yearlyAvailable && planInfo?.period === "monthly" && (
          <div className="rounded-2xl border border-gray-200 p-5 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("subscription.changeTitle")}
            </p>
            <p className="text-sm text-gray-500 mb-4">{t("subscription.changeYearlyHint")}</p>
            <button
              type="button"
              onClick={() => setConfirmTarget("yearly")}
              className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-violet-600 text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
            >
              {t("subscription.changeYearlyCta")}
            </button>
          </div>
        )}

        {isPro && membership && !pendingInterval && planInfo?.period === "yearly" && (
          <div className="rounded-2xl border border-gray-200 p-5 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              {t("subscription.changeTitle")}
            </p>
            <p className="text-sm text-gray-500 mb-4">{t("subscription.changeMonthlyHint")}</p>
            <button
              type="button"
              onClick={() => setConfirmTarget("monthly")}
              className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-violet-600 text-violet-700 text-sm font-semibold hover:bg-violet-50 transition-colors"
            >
              {t("subscription.changeMonthlyCta")}
            </button>
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

        {/* Switch confirmation popup */}
        {confirmTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
            onClick={() => setConfirmTarget(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t("subscription.switchConfirmTitle")}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t("subscription.switchConfirmBody")
                  .replace("{target}", switchTargetWord())
                  .replace("{date}", endDate || t("subscription.periodEnd"))}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmTarget(null)}
                  className="flex-1 inline-flex items-center justify-center h-9 px-5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  {t("subscription.notNow")}
                </button>
                <form action={changeSubscription} className="flex-1">
                  <input type="hidden" name="interval" value={confirmTarget} />
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center h-9 px-5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                  >
                    {t("subscription.scheduleCta")}
                  </button>
                </form>
              </div>
            </div>
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
    </div>
  );
}