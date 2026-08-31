"use client";

import { useConsent } from "@/lib/cookies/consent-context";
import { useI18n } from "@/lib/i18n/provider";

export function CookieConsentBanner() {
  const { status, setConsent } = useConsent();
  const { t } = useI18n();

  if (status !== "pending") return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookieConsent.title")}
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-lg bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              {t("cookieConsent.title")}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {t("cookieConsent.description")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setConsent("accepted")}
            className="flex-1 h-10 rounded-xl bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            {t("cookieConsent.accept")}
          </button>
          <button
            onClick={() => setConsent("refused")}
            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            {t("cookieConsent.refuse")}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          {t("cookieConsent.learnMore")}
        </p>
      </div>
    </div>
  );
}
