"use client";

import { startSubscription } from "@/app/dashboard/actions";
import { useI18n } from "@/lib/i18n/provider";
import type { BillingInterval } from "@/lib/plans";

interface PaymentMethodModalProps {
  open: boolean;
  interval: BillingInterval;
  next?: string;
  tpl?: string;
  /** False while the user is still in onboarding (no profile row yet).
   *  Chariow requires the profile's display_name + phone, so the Mobile Money
   *  option is disabled until it exists. */
  hasProfile?: boolean;
  onClose: () => void;
}

export function PaymentMethodModal({ open, interval, next, tpl, hasProfile = true, onClose }: PaymentMethodModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("pricing.paymentTitle")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("pricing.paymentSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.cancel")}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <form action={startSubscription}>
            <input type="hidden" name="provider" value="whop" />
            <input type="hidden" name="interval" value={interval} />
            {next && <input type="hidden" name="next" value={next} />}
            {tpl && <input type="hidden" name="tpl" value={tpl} />}
            <button
              type="submit"
              className="w-full flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{t("pricing.payByCard")}</span>
                <span className="block mt-0.5 text-xs text-gray-500 leading-5 line-clamp-2">{t("pricing.payByCardDesc")}</span>
              </span>
              <span className="text-gray-300">›</span>
            </button>
          </form>

          {hasProfile ? (
            <form action={startSubscription}>
              <input type="hidden" name="provider" value="chariow" />
              <input type="hidden" name="interval" value={interval} />
              {next && <input type="hidden" name="next" value={next} />}
              {tpl && <input type="hidden" name="tpl" value={tpl} />}
              <button
                type="submit"
                className="w-full flex items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="7" y="2" width="10" height="20" rx="2" />
                    <path d="M11 18h2" />
                  </svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-gray-900">{t("pricing.payByMobileMoney")}</span>
                  <span className="block mt-0.5 text-xs text-gray-500 leading-5 line-clamp-2">{t("pricing.payByMobileMoneyDesc")}</span>
                </span>
                <span className="text-gray-300">›</span>
              </button>
            </form>
          ) : (
            <div
              aria-disabled="true"
              className="w-full flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left opacity-60"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="7" y="2" width="10" height="20" rx="2" />
                  <path d="M11 18h2" />
                </svg>
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{t("pricing.payByMobileMoney")}</span>
                <span className="block mt-0.5 text-xs text-gray-500 leading-5 line-clamp-2">{t("pricing.mobileMoneyUnavailable")}</span>
              </span>
              <span className="text-gray-300">›</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
