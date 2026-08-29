"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { updateProfile } from "@/app/dashboard/actions";
import { Input } from "@/components/auth/Input";
import { Field } from "@/components/auth/Field";
import { Alert } from "@/components/auth/Alert";
import { CountrySelect } from "@/components/CountrySelect";
import { useI18n } from "@/lib/i18n/provider";
import type { Profile } from "@/types/database";

interface AccountFormProps {
  profile: Profile;
}

export function AccountForm({ profile }: AccountFormProps) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success?: string; error?: string } | null, formData: FormData) => {
      try {
        await updateProfile(formData);
        return { success: t("account.success") };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
        return { error: e instanceof Error ? e.message : t("account.error") };
      }
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Alert type="error">{state?.error}</Alert>
      <Alert type="success">{state?.success}</Alert>

      <Field label={t("account.displayName")}>
        <Input
          name="display_name"
          defaultValue={profile.display_name}
          placeholder="Jean Dupont"
          required
        />
      </Field>

      <Field label={t("account.tagline")}>
        <Input
          name="tagline"
          defaultValue={profile.tagline}
          placeholder={t("account.taglinePlaceholder")}
          required
        />
      </Field>

      <Field label={t("account.bio")} hint={`${(profile.bio || "").length}/280`}>
        <textarea
          name="bio"
          defaultValue={profile.bio || ""}
          maxLength={280}
          rows={3}
          placeholder={t("account.bioPlaceholder")}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[14px] placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 resize-none"
        />
      </Field>

      <Field label={t("account.city")}>
        <Input
          name="city"
          defaultValue={profile.city}
          placeholder="Dakar"
          required
        />
      </Field>

      <Field label={t("account.country")}>
        <CountrySelect
          name="country"
          defaultValue={profile.country}
          required
          className="h-11"
        />
      </Field>

      <Field label={t("account.phone")} hint={t("account.phoneHint")}>
        <Input
          name="phone_e164"
          defaultValue={profile.phone_e164}
          placeholder="+221 77 123 45 67"
          type="tel"
          required
        />
      </Field>

      {/* Hidden fields required by the action */}
      <input type="hidden" name="template" value={profile.template} />

      <button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-lg bg-accent text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
        {t("account.save")}
      </button>
    </form>
  );
}
