import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Check, X, MessageCircle, Banknote, Zap, Tags, Sparkles } from "lucide-react";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { MarketingMasthead } from "@/components/marketing/MarketingMasthead";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { CompareTable } from "@/components/marketing/CompareTable";
import { CtaSection } from "@/components/marketing/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title:
      msg.comparison?.title ??
      "Bizko vs Linktree vs Beacons : Quel outil pour les indépendants africains ?",
    description:
      msg.comparison?.description ??
      "Découvrez pourquoi Bizko est la meilleure alternative à Linktree pour les professionnels africains souhaitant un lien professionnel qui convertit en WhatsApp.",
    alternates: {
      canonical: "https://bizko.pro/comparison",
    },
  };
}

function Yes({ children }: { children?: ReactNode }) {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <Check className="size-5 shrink-0 text-accent" aria-hidden />
      {children}
    </span>
  );
}

function No() {
  return (
    <span className="flex items-center gap-2 whitespace-nowrap">
      <X className="size-5 shrink-0 text-gray-300" aria-hidden />
      Non
    </span>
  );
}

function Limited() {
  return <span className="whitespace-nowrap">Limité</span>;
}

const featureIcons = [
  <MessageCircle key="wa" className="size-6" aria-hidden />,
  <Banknote key="bank" className="size-6" aria-hidden />,
  <Zap key="zap" className="size-6" aria-hidden />,
  <Tags key="tags" className="size-6" aria-hidden />,
  <Sparkles key="sparkles" className="size-6" aria-hidden />,
];

const advantages = [
  {
    title: "WhatsApp d'abord",
    text: "Le seul outil avec bouton WhatsApp contextuel pré-rempli pour chaque service, augmentant considérablement les taux de conversion.",
  },
  {
    title: "Prix adapté au marché local",
    text: "Forfait gratuit généreux et options payantes en monnaie locale (XOF/XAF) adaptées au pouvoir d'achat africain.",
  },
  {
    title: "Ultra-léger pour connexions lentes",
    text: "Optimisé pour charger en moins de 1,5 seconde sur réseau 3G, essentiel pour atteindre les clients partout en Afrique.",
  },
  {
    title: "Services avec prix affichés",
    text: "Présentez clairement vos services et leurs prix, pas juste une liste de liens génériques.",
  },
  {
    title: "Première mover en Afrique francophone",
    text: "Spécialement conçu pour répondre aux besoins uniques des indépendants africains, avec support local et compréhension culturelle.",
  },
];

export default async function ComparisonPage() {
  const rows = [
    {
      label: "Bouton WhatsApp contextuel",
      values: [
        <Yes key="1">Oui, par service</Yes>,
        <No key="2" />,
        <No key="3" />,
        <No key="4" />,
        <No key="5" />,
      ],
    },
    {
      label: "Prix de départ",
      values: [
        <span key="1" className="whitespace-nowrap">
          <span className="font-semibold text-accent">Gratuit</span>
          <br />
          <span className="text-sm text-gray-500">(Forfait libre)</span>
        </span>,
        <span key="2" className="whitespace-nowrap">
          <span className="font-semibold text-gray-600">Gratuit</span>
        </span>,
        <span key="3" className="whitespace-nowrap">
          <span className="font-semibold text-gray-600">~$6/mois</span>
          <br />
          <span className="text-sm text-gray-500">(Facturé annuellement)</span>
        </span>,
        <span key="4" className="whitespace-nowrap">
          <span className="font-semibold text-gray-600">Gratuit</span>
        </span>,
        <span key="5" className="whitespace-nowrap">
          <span className="font-semibold text-gray-600">~$10/mois</span>
          <br />
          <span className="text-sm text-gray-500">(Facturé annuellement)</span>
        </span>,
      ],
    },
    {
      label: "Paiement en monnaie locale (XOF/XAF)",
      values: [
        <Yes key="1">Oui</Yes>,
        <No key="2" />,
        <No key="3" />,
        <No key="4" />,
        <No key="5" />,
      ],
    },
    {
      label: "Temps de chargement (3G)",
      values: [
        <span key="1" className="font-semibold text-accent">
          &lt;1.5s
        </span>,
        <span key="2" className="whitespace-nowrap">~3-5s</span>,
        <span key="3" className="whitespace-nowrap">~3-5s</span>,
        <span key="4" className="whitespace-nowrap">~2-4s</span>,
        <span key="5" className="whitespace-nowrap">~2-4s</span>,
      ],
    },
    {
      label: "Affichage des prix des services",
      values: [
        <Yes key="1">Oui, avec devis</Yes>,
        <No key="2" />,
        <No key="3" />,
        <Limited key="4" />,
        <Yes key="5">Oui</Yes>,
      ],
    },
    {
      label: "Galerie portfolio intégrée",
      values: [
        <Yes key="1">Oui</Yes>,
        <No key="2" />,
        <No key="3" />,
        <No key="4" />,
        <Limited key="5" />,
      ],
    },
    {
      label: "Analytics basiques",
      values: [
        <Yes key="1">Oui</Yes>,
        <Limited key="2" />,
        <Yes key="3">Oui</Yes>,
        <Limited key="4" />,
        <Yes key="5">Oui</Yes>,
      ],
    },
    {
      label: "Nom de domaine personnalisé",
      values: [
        <Yes key="1">Oui (bientôt)</Yes>,
        <No key="2" />,
        <Yes key="3">Oui</Yes>,
        <No key="4" />,
        <Yes key="5">Oui</Yes>,
      ],
    },
    {
      label: "Conçu pour l'Afrique francophone",
      values: [
        <Yes key="1">Oui</Yes>,
        <No key="2" />,
        <No key="3" />,
        <No key="4" />,
        <No key="5" />,
      ],
    },
  ];

  return (
    <main>
      <MarketingMasthead />

      <MarketingHero
        eyebrow="Comparatif"
        title="Bizko vs Linktree vs Beacons : Quel outil pour les indépendants africains ?"
        subtitle="Une comparaison détaillée des fonctionnalités, prix et performances pour vous aider à choisir la meilleure solution de lien en bio pour votre activité professionnelle en Afrique."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <CompareTable
          head={["Fonctionnalité", "Bizko", "Linktree Gratuit", "Linktree Pro", "Beacons Gratuit", "Beacons Pro"]}
          highlightColumn={1}
          rows={rows}
        />
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="Pourquoi Bizko"
            title="Pourquoi Bizko gagne pour les indépendants africains"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={featureIcons[index]}
                title={item.title}
                description={item.text}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Prêt à créer votre lien professionnel qui convertit ?"
        subtitle="Rejoignez des centaines d'indépendants africains qui ont déjà choisi Bizko pour développer leur activité en ligne."
        primary={{ href: "/signup", label: "Commencer gratuitement" }}
        secondary={{ href: "/demo", label: "Voir la démo" }}
      />
    </main>
  );
}