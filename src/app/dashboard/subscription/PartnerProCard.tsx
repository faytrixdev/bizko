import Link from "next/link";

export function PartnerProCard() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            Actif
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-gray-900">
          Pro — via partenariat
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Votre accès Pro est offert grâce à votre statut de partenaire Bizko.
          Il reste actif tant que le partenariat est actif.
        </p>

        <div className="mt-6">
          <Link
            href="/dashboard/partner"
            className="inline-flex items-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Espace Partenaire
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Pas de carte bancaire ni de renouvellement automatique — votre accès
          est géré via votre statut de partenaire.
        </p>
      </div>
    </div>
  );
}
