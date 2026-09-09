import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.comparison?.title ?? "Bizko vs Linktree vs Beacons : Quel outil pour les indépendants africains ?",
    description: msg.comparison?.description ?? "Découvrez pourquoi Bizko est la meilleure alternative à Linktree pour les professionnels africains souhaitant un lien professionnel qui convertit en WhatsApp.",
    alternates: {
      canonical: "https://bizko.pro/comparison",
    },
  };
}

export default async function ComparisonPage() {
  const msg = await getServerMessages();
  const t = (key: string, defaultValue: string) => {
    // Simple fallback: try to get from msg, otherwise return default
    // Since we don't have nested translation structure, we'll just return default for now
    return defaultValue;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex">
            {/* Assuming Logo component exists */}
            <span className="text-xl font-bold text-gray-900">Bizko</span>
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-accent text-white px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
              Bizko vs Linktree vs Beacons : Quel outil pour les indépendants africains ?
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Une comparaison détaillée des fonctionnalités, prix et performances pour vous aider à choisir la meilleure solution de lien en bio pour votre activité professionnelle en Afrique.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonctionnalité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bizko
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linktree Gratuit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Linktree Pro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beacons Gratuit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beacons Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* WhatsApp Integration */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Bouton WhatsApp contextuel
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 22h8a2 2 0 002-2V8l-5-5-5 5v12a2 2 0 002 2z" />
                      </svg>
                      <span className="ml-2">Oui, par service</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                </tr>

                {/* Pricing */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Prix de départ
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-accent">Gratuit</span> <br />
                    <span className="text-sm text-gray-500">(Forfait libre)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-600">Gratuit</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-600">~$6/mois</span> <br />
                    <span className="text-sm text-gray-500">(Facturé annuellement)</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-600">Gratuit</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-600">~$10/mois</span> <br />
                    <span className="text-sm text-gray-500">(Facturé annuellement)</span>
                  </td>
                </tr>

                {/* Currency Support */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Paiement en monnaie locale (XOF/XAF)
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01-.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01-.5-.5h1.707L3.707 7.293a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L11 9.293V5.5a.5.5 0 011 0v3.793l1.146-1.147a.5.5 0 01.707-.001z" />
                      </svg>
                      <span className="ml-2">Oui</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                </tr>

                {/* Performance */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Temps de chargement (3G)
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-accent">&lt;1.5s</span>
                  </td>
                  <td className="px-6 py-4">~3-5s</td>
                  <td className="px-6 py-4">~3-5s</td>
                  <td className="px-6 py-4">~2-4s</td>
                  <td className="px-6 py-4">~2-4s</td>
                </tr>

                {/* Service Pricing */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Affichage des prix des services
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01-.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01-.5-.5h1.707L3.707 7.293a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L11 9.293V5.5a.5.5 0 011 0v3.793l1.146-1.147a.5.5 0 01.707-.001z" />
                      </svg>
                      <span className="ml-2">Oui, avec devis</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Limité</td>
                  <td className="px-6 py-4">Oui</td>
                </tr>

                {/* Portfolio */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Galerie portfolio intégrée
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                      <span className="ml-2">Oui</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Limité</td>
                </tr>

                {/* Analytics */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Analytics basiques
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01-.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01-.5-.5h1.707L3.707 7.293a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L11 9.293V5.5a.5.5 0 011 0v3.793l1.146-1.147a.5.5 0 01.707-.001z" />
                      </svg>
                      <span className="ml-2">Oui</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Limité</td>
                  <td className="px-6 py-4">Oui</td>
                  <td className="px-6 py-4">Limité</td>
                  <td className="px-6 py-4">Oui</td>
                </tr>

                {/* Custom Domain */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Nom de domaine personnalisé
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01-.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01-.5-.5h1.707L3.707 7.293a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L11 9.293V5.5a.5.5 0 011 0v3.793l1.146-1.147a.5.5 0 01.707-.001z" />
                      </svg>
                      <span className="ml-2">Oui (bientôt)</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Oui</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Oui</td>
                </tr>

                {/* African Focus */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    Conçu pour l'Afrique francophone
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 2a.5.5 0 01-.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01-.5-.5h1.707L3.707 7.293a.5.5 0 010-.707l.707-.707a.5.5 0 01.707 0L11 9.293V5.5a.5.5 0 011 0v3.793l1.146-1.147a.5.5 0 01.707-.001z" />
                      </svg>
                      <span className="ml-2">Oui</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                  <td className="px-6 py-4">Non</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Key Takeaways */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pourquoi Bizko gagne pour les indépendants africains
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">WhatsApp d'abord</h3>
                <p className="text-gray-600">
                  Le seul outil avec bouton WhatsApp contextuel pré-rempli pour chaque service, augmentant considérablement les taux de conversion.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Prix adapté au marché local</h3>
                <p className="text-gray-600">
                  Forfait gratuit généreux et options payantes en monnaie locale (XOF/XAF) adaptées au pouvoir d'achat africain.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Ultra-léger pour connexions lentes</h3>
                <p className="text-gray-600">
                  Optimisé pour charger en moins de 1,5 seconde sur réseau 3G, essentiel pour atteindre les clients partout en Afrique.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Services avec prix affichés</h3>
                <p className="text-gray-600">
                  Présentez clairement vos services et leurs prix, pas juste une liste de liens génériques.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Première mover en Afrique francophone</h3>
                <p className="text-gray-600">
                  Spécialement conçu pour répondre aux besoins uniques des indépendants africains, avec support local et compréhension culturelle.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à créer votre lien professionnel qui convertit ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Rejoignez des centaines d'indépendants africains qui ont déjà choisi Bizko pour développer leur activité en ligne.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="flex-1 sm:w-auto flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-full px-8 py-4 text-sm font-medium text-gray-700 transition-all duration-200"
              >
                Voir la démo
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/signup"
                className="flex-1 sm:w-auto flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-full font-semibold text-sm transition-all duration-200 shadow-md shadow-[FF6B35]/25 hover:shadow-lg hover:shadow-[FF6B35]/30"
              >
                Commencer gratuitement
                <svg className="w-3.5 h-3.5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}