"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "../actions";
import { AuthShell, Field, Input, PasswordInput, SubmitButton, Alert, GoogleOAuthButton } from "@/components/auth";
import { authErrorText } from "@/components/auth/errorMessage";
import { useI18n } from "@/lib/i18n/provider";
import { useCleanUrl } from "@/lib/hooks";

export default function Login() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const success = searchParams.get("success") || undefined;
  const { t } = useI18n();
  useCleanUrl();

  const successMessage =
    success === "password_updated" ? t("auth2.successPasswordUpdated") : undefined;

  return (
    <AuthShell title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      {successMessage && <div className="mb-5"><Alert type="success">{successMessage}</Alert></div>}
      {authErrorText(t, error) && <div className="mb-5"><Alert type="error">{authErrorText(t, error)}</Alert></div>}

      <GoogleOAuthButton mode="login" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">{t("auth.or")}</span>
        </div>
      </div>

      <form action={login} className="flex flex-col gap-4">
        <Field label={t("auth.email")}>
          <Input name="email" type="email" required autoComplete="email" placeholder={t("auth.emailPlaceholder")} />
        </Field>

        <Field
          label={t("auth.password")}
          hint={
            <Link href="/forgot-password" className="text-gray-500 hover:text-gray-900 underline underline-offset-4">
              {t("auth.forgotLink")}
            </Link>
          }
        >
          <PasswordInput name="password" required autoComplete="current-password" placeholder="••••••••" />
        </Field>

        <div className="pt-2">
          <SubmitButton>{t("auth.loginBtn")}</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          {t("auth.createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
