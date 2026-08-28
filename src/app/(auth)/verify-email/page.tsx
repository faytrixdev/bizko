"use client";

import Link from "next/link";
import { AuthShell } from "@/components/auth";
import { useI18n } from "@/lib/i18n/provider";

export default function VerifyEmail() {
  const { t } = useI18n();

  return (
    <AuthShell title={t("auth.verifyTitle")} subtitle={t("auth.verifySubtitle")}>
      <div className="text-center">
        {/* Email illustration */}
        <div className="mx-auto mb-6 relative h-16 w-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FF6B35]/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">{t("auth.verifyHint")}</p>

        <p className="text-sm text-gray-500">
          {t("auth.wrongEmail")}{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
            {t("auth.restart")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
