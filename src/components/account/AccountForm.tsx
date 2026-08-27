"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { updateProfile } from "@/app/dashboard/actions";
import { Input } from "@/components/auth/Input";
import { Field } from "@/components/auth/Field";
import { Alert } from "@/components/auth/Alert";
import type { Profile } from "@/types/database";

interface AccountFormProps {
  profile: Profile;
}

export function AccountForm({ profile }: AccountFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success?: string; error?: string } | null, formData: FormData) => {
      try {
        await updateProfile(formData);
        return { success: "Profil mis à jour avec succès." };
      } catch (e: unknown) {
        if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
        return { error: e instanceof Error ? e.message : "Une erreur est survenue." };
      }
    },
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Alert type="error">{state?.error}</Alert>
      <Alert type="success">{state?.success}</Alert>

      <Field label="Nom d'affichage">
        <Input
          name="display_name"
          defaultValue={profile.display_name}
          placeholder="Jean Dupont"
          required
        />
      </Field>

      <Field label="Accroche">
        <Input
          name="tagline"
          defaultValue={profile.tagline}
          placeholder="Développeur web & mobile"
          required
        />
      </Field>

      <Field label="Bio" hint={`${(profile.bio || "").length}/280`}>
        <textarea
          name="bio"
          defaultValue={profile.bio || ""}
          maxLength={280}
          rows={3}
          placeholder="Quelques mots sur vous..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[14px] placeholder:text-gray-400 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 resize-none"
        />
      </Field>

      <Field label="Ville">
        <Input
          name="city"
          defaultValue={profile.city}
          placeholder="Dakar"
          required
        />
      </Field>

      <Field label="Pays">
        <Input
          name="country"
          defaultValue={profile.country}
          placeholder="Sénégal"
          required
        />
      </Field>

      <Field label="Téléphone" hint="Format international">
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
        className="h-11 w-full rounded-lg bg-[#FF6B35] text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
        Enregistrer
      </button>
    </form>
  );
}
