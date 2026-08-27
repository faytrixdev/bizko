import Link from "next/link";
import { login } from "../actions";
import { AuthShell, Field, Input, PasswordInput, SubmitButton, Alert, GoogleOAuthButton } from "@/components/auth";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <AuthShell title="Welcome back" subtitle="Ravis de te revoir - connecte-toi pour gerer ton Bizko.">
      {success && <div className="mb-5"><Alert type="success">{decodeURIComponent(success)}</Alert></div>}
      {error && <div className="mb-5"><Alert type="error">{decodeURIComponent(error)}</Alert></div>}

      <GoogleOAuthButton mode="login" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">ou</span>
        </div>
      </div>

      <form action={login} className="flex flex-col gap-4">
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" placeholder="toi@exemple.com" />
        </Field>

        <Field
          label="Mot de passe"
          hint={
            <Link href="/forgot-password" className="text-gray-500 hover:text-gray-900 underline underline-offset-4">
              Oublie ?
            </Link>
          }
        >
          <PasswordInput name="password" required autoComplete="current-password" placeholder="••••••••" />
        </Field>

        <div className="pt-2">
          <SubmitButton>Se connecter</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Pas de compte ?{" "}
        <Link href="/signup" className="font-medium text-gray-900 underline underline-offset-4 decoration-gray-300 hover:decoration-gray-900">
          Creer ton Bizko
        </Link>
      </p>

      <p className="mt-8 text-center text-xs leading-4 text-gray-400">
        Protege par Supabase.
      </p>
    </AuthShell>
  );
}
