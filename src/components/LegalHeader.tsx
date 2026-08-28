"use client";

import Link from "next/link";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { useI18n } from "@/lib/i18n/provider";

export function LegalHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-gray-100/60">
      <div className="max-w-[640px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="inline-flex">
          <img src="/logo.png" alt="Bizko" className="h-7" />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitch />
          <Link
            href="/"
            className="inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("legal.back")}
          </Link>
        </div>
      </div>
    </header>
  );
}
