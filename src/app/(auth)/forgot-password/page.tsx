"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { forgotPassword } from "../actions";
import { AuthShell, Field, Input, SubmitButton, Alert } from "@/components/auth";
import { authErrorText } from "@/components/auth/errorMessage";
import { useI18n } from "@/lib/i18n/provider";
import { useCleanUrl } from "@/lib/hooks";

export default function ForgotPassword() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const success = searchParams.get("success") || undefined;
  const { t } = useI18n();
  useCleanUrl();

  const successMessage = success === "email_sent" ? t("auth2.successForgotEmail") : undefined;

  return (
    <AuthShell title={t("auth.forgotTitle")} subtitle={t("auth.forgotSubtitle")}>
      {authErrorText(t, error) && <div className="mb-5"><Alert type="error">{authErrorText(t, error)}</Alert></div>}
      {successMessage && <div className="mb-5"><Alert type="success">{successMessage}</Alert></div>}

      <form action={forgotPassword} className="flex flex-col gap-4">
        <Field label={t("auth.email")}>
          <Input name="email" type="email" required autoComplete="email" placeholder={t("auth.emailPlaceholder")} />
        </Field>
        <div className="pt-2">
          <SubmitButton>{t("auth.forgotBtn")}</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.rememberPassword")}{" "}
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          {t("auth.backLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
