"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/messages";

export function LocaleSwitch() {
  const { locale, setLocale } = useI18n();
  const router = useRouter();

  function handleChange(l: Locale) {
    setLocale(l);
    router.refresh();
  }

  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-medium">
      {(["fr", "en"] as Locale[]).map((l) => (
        <button key={l} onClick={() => handleChange(l)} className={`px-2.5 py-1 rounded-md transition ${locale === l ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
