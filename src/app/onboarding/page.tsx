"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/lib/i18n/provider";
import { completeOnboarding } from "./actions";
import { UsernameField } from "@/components/UsernameField";
import { CountrySelect } from "@/components/CountrySelect";
import { CustomSelect } from "@/components/CustomSelect";

const ERROR_KEYS: Record<string, string> = {
  username_invalide: "onboarding.errorUsernameInvalid",
  username_reserve: "onboarding.errorUsernameReserved",
  username_pris: "onboarding.errorUsernameTaken",
  champs_requis: "onboarding.errorRequired",
  echec: "onboarding.errorGeneric",
};

function Submit() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? t("onboarding.publishing") : t("onboarding.publishBtn")}
    </button>
  );
}

export default function Onboarding() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const { t } = useI18n();
  const [usernameStatus, setUsernameStatus] = useState("idle");

  const errorMsg = error ? t(ERROR_KEYS[error] ?? "onboarding.errorGeneric") : undefined;

  const handleStatusChange = useCallback((status: string) => {
    setUsernameStatus(status);
  }, []);

  const usernameMessage =
    usernameStatus === "available" ? (
      <span className="text-xs text-green-600">{t("username.available")}</span>
    ) : usernameStatus === "unavailable" ? (
      <span className="text-xs text-red-600">{t("username.taken")}</span>
    ) : usernameStatus === "invalid" ? (
      <span className="text-xs text-red-600">{t("username.invalid")}</span>
    ) : (
      <span className="text-xs text-gray-400">{t("username.idle")}</span>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-lg border border-gray-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-6 w-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">B</span>
          <span className="text-xs font-medium tracking-widest uppercase text-gray-400">{t("onboarding.step")}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight font-display text-gray-900">{t("onboarding.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("onboarding.subtitle")}</p>
        {errorMsg && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{errorMsg}</p>}
        <form action={completeOnboarding} className="mt-6 flex flex-col gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">1</span> {t("onboarding.step1")}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="shrink-0 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg px-3 h-11 inline-flex items-center">bizko.pro/</span>
              <UsernameField onStatusChange={handleStatusChange} />
            </div>
            <div className="mt-1.5">{usernameMessage}</div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">2</span> {t("onboarding.step2")}</p>
            <div className="flex flex-col gap-3 mt-3">
              <input name="display_name" required maxLength={60} placeholder={t("onboarding.namePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <input name="tagline" required maxLength={60} placeholder={t("onboarding.taglinePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <div className="flex flex-col sm:flex-row gap-3">
                <input name="city" required placeholder={t("onboarding.cityPlaceholder")} className="w-full sm:flex-[2] min-w-0 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <CountrySelect name="country" defaultValue="CI" required className="flex-1 sm:flex-none sm:w-40" />
              </div>
              <input name="phone_e164" required placeholder={t("onboarding.phonePlaceholder")} type="tel" inputMode="tel" autoComplete="tel" pattern="^\+[0-9]{6,15}$" title={t("onboarding.phoneHint")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900 w-full" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">3</span> {t("onboarding.step3")}</p>
            <div className="flex flex-col gap-3 mt-3">
              <input name="service_title" required maxLength={60} placeholder={t("onboarding.servicePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
              <div className="flex gap-2">
                <input name="service_price" type="number" placeholder={t("onboarding.pricePlaceholder")} className="flex-1 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <CustomSelect
                  name="service_currency"
                  defaultValue="XOF"
                  options={[
                    { value: "XOF", label: "XOF" },
                    { value: "XAF", label: "XAF" },
                    { value: "NGN", label: "NGN" },
                    { value: "KES", label: "KES" },
                    { value: "ZAR", label: "ZAR" },
                    { value: "DZD", label: "DZD" },
                    { value: "GHS", label: "GHS" },
                    { value: "TZS", label: "TZS" },
                    { value: "UGX", label: "UGX" },
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                    { value: "GBP", label: "GBP" },
                  ]}
                  className="w-28 h-11"
                />
              </div>
            </div>
          </div>

          <Submit />
        </form>
      </div>
    </div>
  );
}
