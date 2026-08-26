import Link from "next/link";
import { resetPassword } from "../actions";
import { AuthShell, Field, PasswordInput, SubmitButton, Alert } from "@/components/auth";

export default async function ResetPassword({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Tu y es presque — choisis quelque chose de solide.">
      {error && <div className="mb-5"><Alert type="error">{decodeURIComponent(error)}</Alert></div>}

      <form action={resetPassword} className="flex flex-col gap-4">
        <Field label="Nouveau mot de passe" hint="6+ caracteres">
          <PasswordInput name="password" required autoComplete="new-password" placeholder="••••••••" />
        </Field>
        <Field label="Confirmer">
          <PasswordInput name="confirm" required autoComplete="new-password" placeholder="••••••••" />
        </Field>
        <div className="pt-2">
          <SubmitButton>Mettre a jour</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          Retour au login
        </Link>
      </p>
    </AuthShell>
  );
}
