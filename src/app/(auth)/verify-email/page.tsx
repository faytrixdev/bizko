"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell, Alert, Field, Input, SubmitButton } from "@/components/auth";
import { resendConfirmationEmail } from "../actions";
import { useI18n } from "@/lib/i18n/provider";

type ResendState = { error: string } | { success: string };

export default function VerifyEmail() {
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    async (_prev: ResendState | null, formData: FormData): Promise<ResendState> => {
      const email = (formData.get("email") as string)?.trim();
      if (!email) return { error: t("auth.emailRequired") };
      return resendConfirmationEmail(email);
    },
    null
  );

  const isSuccess = state != null && "success" in state;
  const isError = state != null && "error" in state;
  const hasSubmitted = isSuccess || isError;

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

        {/* Alerts */}
        {isSuccess && (
          <Alert type="success">{state.success}</Alert>
        )}
        {isError && (
          <Alert type="error">{state.error}</Alert>
        )}

        {/* Hint - only before first submit */}
        {!hasSubmitted && (
          <p className="text-sm text-gray-500 mb-5">{t("auth.verifyHint")}</p>
        )}

        {/* Resend form */}
        <form action={formAction} className="flex flex-col gap-4">
          <Field label={t("auth.email")}>
            <Input name="email" type="email" required autoComplete="email" placeholder={t("auth.emailPlaceholder")} />
          </Field>
          <SubmitButton>{t("auth.resendEmail")}</SubmitButton>
        </form>

        {/* Footer links */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
