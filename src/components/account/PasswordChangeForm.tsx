"use client";

import React from "react";
import { useActionState } from "react";
import { changePassword } from "@/app/(auth)/actions";
import { Input } from "@/components/auth/Input";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Field } from "@/components/auth/Field";
import { Alert } from "@/components/auth/Alert";

export function PasswordChangeForm() {
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

      <Field label="Mot de passe actuel">
        <PasswordInput
          name="currentPassword"
          required
          autoComplete="current-password"
        />
      </Field>

      <Field label="Nouveau mot de passe" hint="6 caractères minimum">
        <PasswordInput
          name="newPassword"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>

      <Field label="Confirmer le mot de passe">
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
        className="h-11 w-full rounded-lg bg-[#FF6B35] text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
        Modifier le mot de passe
      </button>
    </form>
  );
}
