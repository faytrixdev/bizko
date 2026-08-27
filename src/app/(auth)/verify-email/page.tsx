"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell, Alert, Field, Input, SubmitButton } from "@/components/auth";
import { resendConfirmationEmail } from "../actions";

type ResendState = { error: string } | { success: string };

export default function VerifyEmail() {
  const [state, formAction] = useActionState(
    async (_prev: ResendState | null, formData: FormData): Promise<ResendState> => {
      const email = (formData.get("email") as string)?.trim();
      if (!email) return { error: "Veuillez saisir une adresse email." };
      return resendConfirmationEmail(email);
    },
    null
  );

  const isSuccess = state != null && "success" in state;
  const isError = state != null && "error" in state;

  return (
    <AuthShell title="Verifie ton email" subtitle="On t'a envoye un lien de confirmation.">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg">
          e
        </div>

        {isSuccess && (
          <div className="mt-5">
            <Alert type="success">{state.success}</Alert>
          </div>
        )}
        {isError && (
          <div className="mt-5">
            <Alert type="error">{state.error}</Alert>
          </div>
        )}

        {!isSuccess && (
          <div className="mt-5">
            <Alert type="success">Si tu ne recois rien en 2 minutes, reessaie avec la meme adresse.</Alert>
          </div>
        )}

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" placeholder="toi@exemple.com" />
          </Field>
          <SubmitButton>Renvoyer l&apos;email</SubmitButton>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="h-11 rounded-lg border border-gray-200 bg-white inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour a la connexion
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Mauvaise adresse ?{" "}
          <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
            Recommencer
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
