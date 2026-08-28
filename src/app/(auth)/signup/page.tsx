"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signup } from "../actions";
import { AuthShell, Field, Input, PasswordInput, SubmitButton, Alert, GoogleOAuthButton } from "@/components/auth";
import { useI18n } from "@/lib/i18n/provider";

export default function Signup() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const { t } = useI18n();

  return (
    <AuthShell title={t("auth.signupTitle")} subtitle={t("auth.signupSubtitle")}>
      {error && (
        <div className="mb-5">
          <Alert type="error">{decodeURIComponent(error)}</Alert>
        </div>
      )}

      <GoogleOAuthButton mode="signup" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">{t("auth.or")}</span>
        </div>
      </div>

      <form action={signup} className="flex flex-col gap-4">
        <Field label={t("auth.email")}>
          <Input name="email" type="email" required autoComplete="email" placeholder="toi@exemple.com" />
        </Field>

        <Field label={t("auth.password")} hint={t("auth.passwordHint")}>
          <PasswordInput name="password" required autoComplete="new-password" placeholder="••••••••" />
        </Field>

        <div className="pt-2">
          <SubmitButton>{t("auth.signupBtn")}</SubmitButton>
        </div>
        <p className="text-center text-xs text-gray-400">
          En creant un compte, tu acceptes nos{" "}
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-gray-600">
            conditions
          </Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          {t("auth.goLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
