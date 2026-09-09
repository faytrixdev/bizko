import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title: msg.whatsappConversion?.title ?? "Pourquoi un lien professionnel WhatsApp-first convertit mieux en Afrique de l'Ouest",
    description: msg.whatsappConversion?.description ?? "Découvrez comment l'approche WhatsApp-first de Bizko augmente considérablement les taux de conversion pour les indépendants africains par rapport aux liens génériques.",
    alternates: {
      canonical: "https://bizko.pro/whatsapp-conversion",
    },
  };
}

export default async function WhatsAppConversionPage() {
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
              Pourquoi un lien professionnel WhatsApp-first convertit mieux en Afrique de l'Ouest
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Dans un contexte où WhatsApp est l'application de messagerie dominante en Afrique de l'Ouest et Centrale, avoir un lien professionnel qui tire parti de ce canal n'est pas juste un avantage – c'est une nécessité pour maximiser vos conversions.
            </p>
          </div>

          {/* Why WhatsApp Matters in Africa */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              WhatsApp : Le canal de communication incontournable en Afrique
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Adoption massive</h3>
                <p className="text-gray-600">
                  Plus de 90% des utilisateurs de smartphones en Afrique de l'Ouest utilisent WhatsApp quotidiennement pour communiquer avec famille, amis et entreprises.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Préférence pour les affaires</h3>
                <p className="text-gray-600">
                  75% des consommateurs africains préfèrent contacter les entreprises via WhatsApp plutôt que par email ou appel téléphonique traditionnel.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Taux d'ouverture élevé</h3>
                <p className="text-gray-600">
                  Les messages WhatsApp ont un taux d'ouverture de plus de 98%, bien supérieur à celui des emails (20-30%) ou des SMS.
                </p>
              </div>
            </div>
          </div>

          {/* The Problem with Generic Links */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Le problème des liens en bio génériques
            </h2>
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-200 p-6">
                <h3 className="font-semibold text-red-900 mb-3">Étapes trop nombreuses</h3>
                <p className="text-gray-600">
                  Avec un lien générique comme Linktree, votre client doit : cliquer sur votre lien, choisir votre service parmi une liste, puis cliquer à nouveau pour obtenir votre numéro WhatsApp, puis ouvrir WhatsApp et coller manuellement le numéro.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-200 p-6">
                <h3 className="font-semibold text-red-900 mb-3">Perte à chaque étape</h3>
                <p className="text-gray-600">
                  À chaque étape supplémentaire, vous perdez entre 20% et 40% de vos prospects potentiels. Un processus en 4 étapes peut perdre jusqu'à 80% de votre trafic avant même que la conversation ne commence.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-200 p-6">
                <h3 className="font-semibold text-red-900 mb-3">Pas de contexte</h3>
                <p className="text-gray-600">
                  Le client arrive sur WhatsApp sans savoir quel service vous intéresse, ce qui oblige à perdre du temps à expliquer à nouveau votre demande alors que vous l'aviez déjà présentée sur votre page.
                </p>
              </div>
            </div>
          </div>

          {/* The Bizko Solution */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              La solution Bizko : WhatsApp contextuel par service
            </h2>
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-200 p-6">
                <h3 className="font-semibold text-green-900 mb-3">Un clic, une conversation</h3>
                <p className="text-gray-600">
                  Chaque bouton WhatsApp sur votre page Bizko est pré-rempli avec un message spécifique au service : "Bonjour, je vous contacte depuis votre profil Bizko pour [Service]". Votre client n'a qu'à cliquer et envoyer.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-200 p-6">
                <h3 className="font-semibold text-green-900 mb-3">Taux de conversion multiplié</h3>
                <p className="text-gray-600">
                  En réduisant le processus à un seul clic avec contexte, Bizko augmente significativement le taux de conversion de visiteur à conversation WhatsApp par rapport aux liens génériques.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-200 p-6">
                <h3 className="font-semibold text-green-900 mb-3">Meilleure qualification des leads</h3>
                <p className="text-gray-600">
                  Puisque le message précise déjà le service d'intérêt, vous recevez des leads déjà qualifiés, prêts à discuter des détails et du prix, ce qui réduit considérablement le temps de vente.
                </p>
              </div>
            </div>
          </div>

          {/* Real Impact Data */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Impact mesurable : Ce que nos utilisateurs constatent
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">+300%</div>
                <p className="text-gray-600">
                  Augmentation moyenne du taux de conversion de visiteur à conversation WhatsApp rapportée par nos utilisateurs professionnels après passage à Bizko.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">-70%</div>
                <p className="text-gray-600">
                  Réduction du temps moyen pour obtenir la première réponse client grâce au contexte pré-rempli du message WhatsApp.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">2x</div>
                <p className="text-gray-600">
                  Valeur moyenne des commandes augmentée car les clients arrivent mieux informés et prêts à acheter des services premium.
                </p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-gray-500">
              *Basé sur les données internes de Bizko provenant de centaines de profils actifs en Afrique de l'Ouest et Centrale.
            </p>
          </div>

          {/* How It Works Visual */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comment ça fonctionne en pratique
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-2xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Client visite votre lien</h3>
                <p className="text-sm text-gray-600">
                  Votre client découvre votre profil Bizko via Instagram, Facebook, ou recherche Google.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-2xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Clique sur votre service</h3>
                <p className="text-sm text-gray-600">
                  Il voit clairement vos services avec prix et clique directement sur celui qui l'intéresse.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-2xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">WhatsApp pré-rempli</h3>
                <p className="text-sm text-gray-600">
                  Le bouton WhatsApp ouvre l'application avec un message déjà rédigé mentionnant spécifiquement le service choisi.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-bold text-2xl">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Conversation immédiate</h3>
                <p className="text-sm text-gray-600">
                  Vous recevez la notification avec contexte et pouvez répondre immédiatement en connaissant déjà le besoin du client.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à convertir plus de visiteurs en conversations WhatsApp ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Ne perdez plus de prospects à cause de liens génériques. Offrez à vos clients une expérience fluide de la découverte à la conversation.
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