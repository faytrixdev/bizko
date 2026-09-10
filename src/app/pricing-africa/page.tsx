import type { Metadata } from "next";
import { Banknote, Globe, CreditCard, MessageCircle, TrendingUp, Headset } from "lucide-react";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { MarketingMasthead } from "@/components/marketing/MarketingMasthead";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { PricingCard } from "@/components/marketing/PricingCard";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { FaqItem } from "@/components/marketing/FaqItem";
import { CtaSection } from "@/components/marketing/CtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return {
    title:
      msg.pricingAfrica?.title ??
      "Prix du lien professionnel pour indépendants africains : Forfait gratuit vs Pro",
    description:
      msg.pricingAfrica?.description ??
      "Des tarifs adaptés au pouvoir d'achat africain avec un forfait gratuit complet et des options professionnelles abordables.",
    alternates: {
      canonical: "https://bizko.pro/pricing-africa",
    },
  };
}

const freeFeatures = [
  "Profil professionnel complet",
  "Services avec prix et description",
  "Galerie portfolio (jusqu'à 20 images)",
  "Témoignages clients",
  "Liens sociaux et site web",
  "Bouton WhatsApp par service",
  "Analytics de base",
  "Nom de domaine bizko.pro/tonnom",
  "Optimisé pour connexions lentes (<1.5s 3G)",
];

const proMonthlyFeatures = [
  "Tout du forfait Gratuit",
  "Portfolio illimité",
  "Analytics avancés",
  "Suppression de la marque Bizko",
  "Domaine personnalisé (bientôt)",
  "Priorité dans les résultats de recherche",
  "Support client prioritaire",
];

const proYearlyFeatures = [
  "Tout du forfait Pro Mensuel",
  "2 mois gratuits",
  "Accès aux fonctionnalités beta",
  "Formation vidéo incluse",
];

const advantageIcons = [
  <Banknote key="bank" className="size-6" aria-hidden />,
  <Globe key="globe" className="size-6" aria-hidden />,
  <CreditCard key="card" className="size-6" aria-hidden />,
  <MessageCircle key="msg" className="size-6" aria-hidden />,
  <TrendingUp key="trend" className="size-6" aria-hidden />,
  <Headset key="headset" className="size-6" aria-hidden />,
];

const advantages = [
  {
    title: "Prix en monnaie locale",
    text: "Pas de frais de conversion ni de surprise avec des prix affichés en XOF/XAF, adaptés au pouvoir d'achat ouest-africain.",
  },
  {
    title: "Conçu pour l'Afrique",
    text: "Fonctionnalités spécifiques aux besoins des indépendants africains : WhatsApp contextuel, optimisation pour connexions lentes, support des devises locales.",
  },
  {
    title: "Aucune carte bancaire requise pour démarrer",
    text: "Commencez gratuitement sans avoir besoin de fournir vos informations de carte bancaire, idéal pour tester la plateforme sans risque.",
  },
  {
    title: "Taux de conversion élevé",
    text: "Grâce au bouton WhatsApp contextuel par service, nos utilisateurs constatent jusqu'à 300% d'augmentation des conversations clientes.",
  },
  {
    title: "Évolution avec votre activité",
    text: "Commencez avec le forfait gratuit et passez facilement au Pro quand votre activité se développe, sans perte de données ni interruption de service.",
  },
  {
    title: "Support local et compréhension culturelle",
    text: "Une équipe qui comprend les réalités du marché africain et peut vous aider dans votre langue et votre contexte professionnel spécifique.",
  },
];

const faqs = [
  {
    q: "Puis-je payer avec Mobile Money (Orange Money, MTN Money, etc.) ?",
    a: "Actuellement, nous acceptons les paiements par carte bancaire pour les forfaits Pro. Cependant, nous travaillons activement sur l'intégration des solutions de Mobile Money populaires en Afrique de l'Ouest et Centrale pour offrir davantage d'options de paiement adaptées au contexte local.",
  },
  {
    q: "Y a-t-il des frais cachés ou des engagements ?",
    a: "Absolument pas. Le forfait gratuit est vraiment gratuit et sans engagement. Vous pouvez passer au forfait Pro à tout moment et annuler quand vous le souhaitez, avec un préavis d'un mois pour les facturations mensuelles.",
  },
  {
    q: "Comment les prix en FCFA se comparent-ils aux prix en dollars ou euros ?",
    a: "Nos prix en FCFA sont spécifiquement conçus pour refléter le pouvoir d'achat en Afrique de l'Ouest et Centrale. Par exemple, 2 500 FCFA mensuels représentent environ 3,80 EUR ou 4,10 USD, mais sont ajustés pour être abordables dans le contexte économique local où le salaire minimum moyen varie entre 40 000 et 60 000 FCFA selon les pays.",
  },
  {
    q: "Puis-je commencer gratuitement et passer au Pro plus tard ?",
    a: "Oui, absolument. Tous les utilisateurs commencent avec le forfait gratuit complet. Vous pouvez passer au forfait Pro quand vous le souhaitez depuis votre tableau de bord, et toutes vos données (profil, services, portfolio, témoignages) seront conservées sans interruption.",
  },
];

export default async function PricingAfricaPage() {
  return (
    <main>
      <MarketingMasthead />

      <MarketingHero
        eyebrow="Tarifs"
        title="Prix du lien professionnel pour indépendants africains : Forfait gratuit vs Pro"
        subtitle="Des tarifs adaptés au pouvoir d'achat africain avec un forfait gratuit complet et des options professionnelles abordables en monnaie locale."
      />

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <SectionHeader eyebrow="Plans" title="Choisissez le plan qui convient à votre activité" />
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          <PricingCard
            name="Gratuit"
            price="0 FCFA"
            note="/ mois, pas de carte bancaire requise"
            features={freeFeatures}
            ctaHref="/signup"
            ctaLabel="Commencer gratuitement"
          />
          <PricingCard
            name="Pro Mensuel"
            price="2 500 FCFA"
            note="/ mois, facturation mensuelle"
            features={proMonthlyFeatures}
            ctaHref="/signup"
            ctaLabel="Choisir ce plan"
          />
          <PricingCard
            name="Pro Annuel"
            price="25 000 FCFA"
            note="/ an, équivaut à 2 083 FCFA/mois (économisez 16%)"
            features={proYearlyFeatures}
            popular
            ctaHref="/signup"
            ctaLabel="Choisir ce plan"
          />
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader
            eyebrow="Pourquoi Bizko"
            title="Pourquoi choisir Bizko pour votre activité africaine ?"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={advantageIcons[index]}
                title={item.title}
                description={item.text}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <SectionHeader eyebrow="FAQ" title="Questions fréquentes" />
          <div className="mt-12 max-w-3xl">
            {faqs.map((faq, index) => (
              <FaqItem key={faq.q} index={index} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Prêt à choisir le plan qui convient à votre activité africaine ?"
        subtitle="Rejoignez des centaines d'indépendants africains qui ont déjà choisi Bizko pour développer leur activité en ligne avec des tarifs adaptés à leur réalité."
        primary={{ href: "/signup", label: "Commencer gratuitement" }}
        secondary={{ href: "/demo", label: "Voir la démo" }}
      />
    </main>
  );
}