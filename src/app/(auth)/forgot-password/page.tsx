import Link from "next/link";
import { forgotPassword } from "../actions";
import { AuthShell, Field, Input, SubmitButton, Alert } from "@/components/auth";

export default async function ForgotPassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <AuthShell title="Mot de passe oublie ?" subtitle="On t'envoie un lien securise pour en creer un nouveau.">
      {error && <div className="mb-5"><Alert type="error">{decodeURIComponent(error)}</Alert></div>}
      {success && <div className="mb-5"><Alert type="success">{decodeURIComponent(success)}</Alert></div>}

      <form action={forgotPassword} className="flex flex-col gap-4">
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="toi@exemple.com" />
        </Field>
        <div className="pt-2">
          <SubmitButton>Envoyer le lien</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Tu t'en souviens ?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          Retour au login
        </Link>
      </p>
    </AuthShell>
  );
}
