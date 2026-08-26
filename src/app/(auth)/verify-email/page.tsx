import Link from "next/link";
import { AuthShell, Alert } from "../components";

export default async function VerifyEmail({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;

  return (
    <AuthShell title="Verifie ton email" subtitle="On t'a envoye un lien de confirmation.">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg">
          e
        </div>
        {email && (
          <p className="mt-4 text-sm text-gray-500">
            Lien envoye a <span className="font-medium text-gray-900">{decodeURIComponent(email)}</span>
          </p>
        )}

        <div className="mt-5">
          <Alert type="success">Si tu ne recois rien en 2 minutes, reessaie avec la meme adresse.</Alert>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/login" className="h-11 rounded-lg bg-[#FF6B35] text-white inline-flex items-center justify-center text-sm font-semibold hover:bg-[#EA580C] transition">
            J'ai verifie — me connecter
          </Link>
          <Link href="/signup" className="h-11 rounded-lg border border-gray-200 bg-white inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50">
            Renvoyer le lien
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
