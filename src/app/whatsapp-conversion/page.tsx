import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { MarketingMasthead } from "@/components/marketing/MarketingMasthead";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { StatCard } from "@/components/marketing/StatCard";
import { CtaSection } from "@/components/marketing/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title:
      msg.whatsappConversion?.title ??
      "Pourquoi un lien professionnel WhatsApp-first convertit mieux en Afrique de l'Ouest",
    description:
      msg.whatsappConversion?.description ??
      "Découvrez comment l'approche WhatsApp-first de Bizko augmente considérablement les taux de conversion pour les indépendants africains par rapport aux liens génériques.",
    alternates: {
      canonical: "https://bizko.pro/whatsapp-conversion",
    },
  };
}

const problemCases = [
  {
    title: "Étapes trop nombreuses",
    text: "Avec un lien générique comme Linktree, votre client doit : cliquer sur votre lien, choisir votre service parmi une liste, puis cliquer à nouveau pour obtenir votre numéro WhatsApp, puis ouvrir WhatsApp et coller manuellement le numéro.",
  },
  {
    title: "Perte à chaque étape",
    text: "À chaque étape supplémentaire, vous perdez entre 20% et 40% de vos prospects potentiels. Un processus en 4 étapes peut perdre jusqu'à 80% de votre trafic avant même que la conversation ne commence.",
  },
  {
    title: "Pas de contexte",
    text: "Le client arrive sur WhatsApp sans savoir quel service vous intéresse, ce qui oblige à perdre du temps à expliquer à nouveau votre demande alors que vous l'aviez déjà présentée sur votre page.",
  },
];

const solutionCases = [
  {
    title: "Un clic, une conversation",
    text: 'Chaque bouton WhatsApp sur votre page Bizko est pré-rempli avec un message spécifique au service : "Bonjour, je vous contacte depuis votre profil Bizko pour [Service]". Votre client n\'a qu\'à cliquer et envoyer.',
  },
  {
    title: "Taux de conversion multiplié",
    text: "En réduisant le processus à un seul clic avec contexte, Bizko augmente significativement le taux de conversion de visiteur à conversation WhatsApp par rapport aux liens génériques.",
  },
  {
    title: "Meilleure qualification des leads",
    text: "Puisque le message précise déjà le service d'intérêt, vous recevez des leads déjà qualifiés, prêts à discuter des détails et du prix, ce qui réduit considérablement le temps de vente.",
  },
];

const stepCases = [
  {
    number: "1",
    title: "Client visite votre lien",
    text: "Votre client découvre votre profil Bizko via Instagram, Facebook, ou recherche Google.",
  },
  {
    number: "2",
    title: "Clique sur votre service",
    text: "Il voit clairement vos services avec prix et clique directement sur celui qui l'intéresse.",
  },
  {
    number: "3",
    title: "WhatsApp pré-rempli",
    text: "Le bouton WhatsApp ouvre l'application avec un message déjà rédigé mentionnant spécifiquement le service choisi.",
  },
  {
    number: "4",
    title: "Conversation immédiate",
    text: "Vous recevez la notification avec contexte et pouvez répondre immédiatement en connaissant déjà le besoin du client.",
  },
];

export default async function WhatsAppConversionPage() {
  return (
    <main>
      <MarketingMasthead />

      <MarketingHero
        eyebrow="WhatsApp-first"
        title="Pourquoi un lien professionnel WhatsApp-first convertit mieux en Afrique de l'Ouest"
        subtitle="Dans un contexte où WhatsApp est l'application de messagerie dominante en Afrique de l'Ouest et Centrale, avoir un lien professionnel qui tire parti de ce canal n'est pas juste un avantage, c'est une nécessité pour maximiser vos conversions."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <SectionHeader
          eyebrow="Pourquoi WhatsApp"
          title="WhatsApp : le canal de communication incontournable en Afrique"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            value=">90%"
            label="Des utilisateurs de smartphones en Afrique de l'Ouest utilisent WhatsApp quotidiennement pour communiquer avec famille, amis et entreprises."
          />
          <StatCard
            value="75%"
            label="Des consommateurs africains préfèrent contacter les entreprises via WhatsApp plutôt que par email ou appel téléphonique traditionnel."
          />
          <StatCard
            value=">98%"
            label="Taux d'ouverture des messages WhatsApp, bien supérieur à celui des emails (20-30%) ou des SMS."
          />
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:py-20 lg:grid-cols-2">
          <div>
            <SectionHeader
              align="left"
              eyebrow="Sans Bizko"
              title="Le problème des liens en bio génériques"
            />
            <div className="mt-8 space-y-4">
              {problemCases.map((c) => (
                <div key={c.title} className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="font-semibold text-red-900">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader
              align="left"
              eyebrow="Avec Bizko"
              title="La solution Bizko : WhatsApp contextuel par service"
            />
            <div className="mt-8 space-y-4">
              {solutionCases.map((c) => (
                <div key={c.title} className="rounded-2xl border border-green-200 bg-green-50 p-6">
                  <h3 className="font-semibold text-green-900">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="Résultats"
            title="Impact mesurable : ce que nos utilisateurs constatent"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              value="+300%"
              label="Augmentation moyenne du taux de conversion de visiteur à conversation WhatsApp rapportée par nos utilisateurs professionnels après passage à Bizko."
            />
            <StatCard
              value="-70%"
              label="Réduction du temps moyen pour obtenir la première réponse client grâce au contexte pré-rempli du message WhatsApp."
            />
            <StatCard
              value="2x"
              label="Valeur moyenne des commandes augmentée car les clients arrivent mieux informés et prêts à acheter des services premium."
            />
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            *Basé sur les données internes de Bizko provenant de centaines de profils actifs en
            Afrique de l'Ouest et Centrale.
          </p>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader eyebrow="Comment ça marche" title="Comment ça fonctionne en pratique" />
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stepCases.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10">
                  <span className="text-2xl font-semibold text-accent">{step.number}</span>
                </div>
                <h3 className="mt-4 font-semibold tracking-tight text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Prêt à convertir plus de visiteurs en conversations WhatsApp ?"
        subtitle="Ne perdez plus de prospects à cause de liens génériques. Offrez à vos clients une expérience fluide de la découverte à la conversation."
        primary={{ href: "/signup", label: "Commencer gratuitement" }}
        secondary={{ href: "/demo", label: "Voir la démo" }}
      />
    </main>
  );
}