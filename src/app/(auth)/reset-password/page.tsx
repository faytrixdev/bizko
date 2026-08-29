"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { exchangeResetCode, resetPassword } from "../actions";
import { AuthShell, Field, PasswordInput, SubmitButton, Alert } from "@/components/auth";
import { authErrorText } from "@/components/auth/errorMessage";
import { useI18n } from "@/lib/i18n/provider";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const code = searchParams.get("code");
  const { t } = useI18n();

  const [exchangeError, setExchangeError] = useState(false);
  const [isPending, startTransition] = useTransition();

  // A recovery link from Supabase lands on /reset-password?code=... with the
  // session token embedded. Exchange it so updateUser() can run with a valid session.
  useEffect(() => {
    if (code) {
      startTransition(async () => {
        const res = await exchangeResetCode(code);
        setExchangeError(res.error);
      });
    }
  }, [code]);

  if (code && isPending) {
    return (
      <AuthShell title={t("auth.resetTitle")}>
        <p className="text-sm text-gray-500 text-center">{t("auth.resendCooldown").replace("{secs}", "…")}</p>
      </AuthShell>
    );
  }

  if (exchangeError) {
    return (
      <AuthShell title={t("auth.resetTitle")}>
        <Alert type="error">{t("auth2.errorResetExpired")}</Alert>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/forgot-password" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
            {t("auth.forgotLink")}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("auth.resetTitle")} subtitle={t("auth.resetSubtitle")}>
      {authErrorText(t, error) && <div className="mb-5"><Alert type="error">{authErrorText(t, error)}</Alert></div>}

      <form action={resetPassword} className="flex flex-col gap-4">
        <Field label={t("auth.resetNewPassword")} hint={t("auth.passwordHint")}>
          <PasswordInput name="password" required autoComplete="new-password" placeholder="••••••••" />
        </Field>
        <Field label={t("auth.resetConfirm")}>
          <PasswordInput name="confirm" required autoComplete="new-password" placeholder="••••••••" />
        </Field>
        <div className="pt-2">
          <SubmitButton>{t("auth.resetBtn")}</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          {t("auth.backLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
