import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.pricingAfrica?.title ?? "Prix du lien professionnel pour indépendants africains : Forfait gratuit vs Pro",
    description: msg.pricingAfrica?.description ?? "Découvrez nos tarifs adaptés au marché africain avec un forfait gratuit généreux et des options Pro en monnaie locale (XOF/XAF).",
    alternates: {
      canonical: "https://bizko.pro/pricing-africa",
    },
  };
}

export default async function PricingAfricaPage() {
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
              Prix du lien professionnel pour indépendants africains : Forfait gratuit vs Pro
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Des tarifs adaptés au pouvoir d'achat africain avec un forfait gratuit complet et des options professionnelles abordables en monnaie locale.
            </p>
          </div>

          {/* Pricing Table */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Choisissez le plan qui convient à votre activité
            </h2>
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
              {/* Free Plan */}
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-2xl mb-4">
                    Gratuit
                  </h3>
                  <p className="text-sm text-gray-500">
                    Parfait pour démarrer
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Profil professionnel complet</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Services avec prix et description</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Galerie portfolio ( jusqu'à 20 images)</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Témoignages clients</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Liens sociaux et site web</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Bouton WhatsApp par service</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Analytics de base</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Nom de domaine bizko.pro/tonnom</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Optimisé pour connexions lentes (&lt;1.5s 3G)</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">
                    0 FCFA
                  </p>
                  <p className="text-sm text-gray-500">
                    / mois - Pas de carte bancaire requise
                  </p>
                </div>
                
                <Link
                  href="/signup"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md"
                >
                  Commencer gratuitement
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Pro Plan Monthly */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-2xl mb-4">
                    Pro Mensuel
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pour les professionnels établis
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Tout du forfait Gratuit</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Portfolio illimité</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Analytics avancés</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Suppression de la marque Bizko</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Domaine personnalisé (bientôt)</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Priorité dans les résultats de recherche</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Support client prioritaire</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">
                    2 500 FCFA
                  </p>
                  <p className="text-sm text-gray-500">
                    / mois - Facturation mensuelle
                  </p>
                </div>
                
                <Link
                  href="/signup"
                  className="mt-6 w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-200 hover:bg-gray-50 rounded-full px-6 py-3 text-sm font-medium text-gray-700 transition-all duration-200"
                >
                  Choisir ce plan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </Link>
              </div>
              
              {/* Pro Plan Yearly */}
              <div className="bg-white rounded-xl p-8 border border-gray-200 ring-2 ring-accent/20">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 text-2xl mb-4">
                    Pro Annuel
                  </h3>
                  <p className="text-sm text-gray-500">
                    Meilleur rapport qualité/prix
                  </p>
                </div>
                
                <div className="badge-absolute inset-0 flex items-center justify-center">
                  <span className="bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Meilleᵉ vente
                  </span>
                </div>
                
                <div className="space-y-6">
                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Tout du forfait Pro Mensuel</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">2 mois gratuits</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Accès aux fonctionnalités beta</span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="ml-2">Formation vidéo incluse</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">
                    25 000 FCFA
                  </p>
                  <p className="text-sm text-gray-500">
                    / an - Équivaut à 2 083 FCFA/mois (économisez 16%)
                  </p>
                </div>
                
                <Link
                  href="/signup"
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-md"
                >
                  Choisir ce plan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Why Choose Bizko Africa */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pourquoi choisir Bizko pour votre activité africaine ?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Prix en monnaie locale</h3>
                <p className="text-gray-600">
                  Pas de frais de conversion ni de surprise avec des prix affichés en XOF/XAF, adaptés au pouvoir d'achat ouest-africain.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Conçu pour l'Afrique</h3>
                <p className="text-gray-600">
                  Fonctionnalités spécifiques aux besoins des indépendants africains : WhatsApp contextuel, optimisation pour connexions lentes, support des devises locales.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Aucune carte bancaire requise pour démarrer</h3>
                <p className="text-gray-600">
                  Commencez gratuitement sans avoir besoin de fournir vos informations de carte bancaire - idéal pour tester la plateforme sans risque.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Taux de conversion élevé</h3>
                <p className="text-gray-600">
                  Grâce au bouton WhatsApp contextuel par service, nos utilisateurs constatent jusqu'à 300% d'augmentation des conversations clientes.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Évolution avec votre activité</h3>
                <p className="text-gray-600">
                  Commencez avec le forfait gratuit et passez facilement au Pro quand votre activité se développe, sans perte de données ni interruption de service.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Support local et compréhension culturelle</h3>
                <p className="text-gray-600">
                  Une équipe qui comprend les réalités du marché africain et peut vous aider dans votre langue et votre contexte professionnel spécifique.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Puis-je payer avec Mobile Money (Orange Money, MTN Money, etc.) ?
                </h3>
                <p className="text-gray-600">
                  Actuellement, nous acceptons les paiements par carte bancaire pour les forfaits Pro. Cependant, nous travaillons activement sur l'intégration des solutions de Mobile Money populaires en Afrique de l'Ouest et Centrale pour offrir davantage d'options de paiement adaptées au contexte local.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Y a-t-il des frais cachés ou des engagements ?
                </h3>
                <p className="text-gray-600">
                  Absolument pas. Le forfait gratuit est vraiment gratuit et sans engagement. Vous pouvez passer au forfait Pro à tout moment et annuler quand vous le souhaitez, avec un préavis d'un mois pour les facturations mensuelles.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Comment les prix en FCFA se comparent-ils aux prix en dollars ou euros ?
                </h3>
                <p className="text-gray-600">
                  Nos prix en FCFA sont spécifiquement conçus pour refléter le pouvoir d'achat en Afrique de l'Ouest et Centrale. Par exemple, 2 500 FCFA mensuels représentent environ 3,80 EUR ou 4,10 USD, mais sont ajustés pour être abordables dans le contexte économique local où le salaire minimum moyen varie entre 40 000 et 60 000 FCFA selon les pays.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Puis-je commencer gratuitement et passer au Pro plus tard ?
                </h3>
                <p className="text-gray-600">
                  Oui absolument ! Tous les utilisateurs commencent avec le forfait gratuit complet. Vous pouvez passer au forfait Pro quand vous le souhaitez depuis votre tableau de bord, et toutes vos données (profil, services, portfolio, témoignages) seront conservées sans interruption.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à choisir le plan qui convient à votre activité africaine ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Rejoignez des centaines d'indépendants africains qui ont déjà choisi Bizko pour développer leur activité en ligne avec des tarifs adaptés à leur réalité.
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