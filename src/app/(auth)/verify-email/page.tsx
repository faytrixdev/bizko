"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell, Alert, SubmitButton } from "@/components/auth";
import { resendConfirmationEmail } from "../actions";
import { useI18n } from "@/lib/i18n/provider";
import { useCleanUrl } from "@/lib/hooks";

const COOLDOWN_SECONDS = 60;

type ResendState = { error: string } | { success: string };

export default function VerifyEmail() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  useCleanUrl();

  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown on mount (email already auto-filled)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const [state, formAction] = useActionState(
    async (_prev: ResendState | null, formData: FormData): Promise<ResendState> => {
      const result = await resendConfirmationEmail(email);
      setCooldown(COOLDOWN_SECONDS);
      return result;
    },
    null
  );

  const isSuccess = state != null && "success" in state;
  const isError = state != null && "error" in state;
  const isLocked = cooldown > 0;

  return (
    <AuthShell title={t("auth.verifyTitle")} subtitle={t("auth.verifySubtitle")}>
      <div className="text-center">
        {/* Email illustration */}
        <div className="mx-auto mb-6 relative h-16 w-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
        </div>

        {/* Alerts */}
        {isSuccess && (
          <Alert type="success">{state.success}</Alert>
        )}
        {isError && (
          <Alert type="error">{state.error}</Alert>
        )}

        {!isSuccess && (
          <>
            <p className="text-sm text-gray-500 mb-4">{t("auth.verifyHint")}</p>

            {/* Email used - read only */}
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-6">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{email || t("auth.email")}</span>
            </div>

            {/* Resend form - uses the email from URL */}
            <form action={formAction} className="flex flex-col gap-4">
              {isLocked ? (
                <button
                  type="button"
                  disabled
                  className="h-11 w-full rounded-lg bg-accent text-white inline-flex items-center justify-center gap-2 text-sm font-semibold opacity-60 cursor-not-allowed"
                >
                  {t("auth.resendCooldown").replace("{secs}", String(cooldown))}
                </button>
              ) : (
                <SubmitButton>{t("auth.resendEmail")}</SubmitButton>
              )}
            </form>
          </>
        )}

        <p className="mt-6 text-sm text-gray-500">
          {t("auth.wrongEmail")}{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
            {t("auth.restart")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

