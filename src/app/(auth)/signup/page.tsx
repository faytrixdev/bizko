import Link from "next/link";
import { signup } from "../actions";
import { AuthShell, Field, Input, PasswordInput, SubmitButton, Alert, GoogleOAuthButton } from "@/components/auth";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <AuthShell title="Creer ton compte" subtitle="Commence gratuitement - ton lien sera pret a partager.">
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
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <form action={signup} className="flex flex-col gap-4">
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="toi@exemple.com" />
        </Field>

        <Field label="Mot de passe" hint="6+ caracteres">
          <PasswordInput name="password" required autoComplete="new-password" placeholder="••••••••" />
        </Field>

        <div className="pt-2">
          <SubmitButton>Creer mon lien gratuit</SubmitButton>
        </div>
        <p className="text-center text-xs text-gray-400">En creant un compte, tu acceptes nos conditions.</p>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Deja un compte ?{" "}
        <Link href="/login" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
