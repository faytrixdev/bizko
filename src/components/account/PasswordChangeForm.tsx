"use client";

import React from "react";
import { useActionState } from "react";
import { changePassword } from "@/app/(auth)/actions";
import { Input } from "@/components/auth/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Field } from "@/components/auth/Field";
import { Alert } from "@/components/auth/Alert";
import { useI18n } from "@/lib/i18n/provider";

export function PasswordChangeForm() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success?: string; error?: string } | null, formData: FormData) => {
      return await changePassword(formData);
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Alert type="error">{state?.error}</Alert>
      <Alert type="success">{state?.success}</Alert>

      <Field label={t("password.current")}>
        <PasswordInput
          name="currentPassword"
          required
          autoComplete="current-password"
        />
      </Field>

      <Field label={t("password.new")} hint={t("password.newHint")}>
        <PasswordInput
          name="newPassword"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>

      <Field label={t("password.confirm")}>
        <PasswordInput
          name="confirmPassword"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-lg bg-accent text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
        {t("password.changeBtn")}
      </button>
    </form>
  );
}
