import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Check, X } from "lucide-react";
import { MarketingMasthead } from "../MarketingMasthead";
import { MarketingHero } from "../MarketingHero";
import { SectionHeader } from "../SectionHeader";
import { CtaSection } from "../CtaSection";
import { FeatureCard } from "../FeatureCard";
import { StatCard } from "../StatCard";
import { PricingCard } from "../PricingCard";
import { FaqItem } from "../FaqItem";
import { CompareTable } from "../CompareTable";

describe("marketing kit", () => {
  it("MarketingMasthead affiche le wordmark et le CTA", () => {
    render(<MarketingMasthead />);
    expect(screen.getByText("Bizko")).toBeInTheDocument();
    expect(screen.getByText("Créer ma page")).toHaveAttribute("href", "/signup");
  });

  it("MarketingHero rend titre, sous-titre et eyebrow", () => {
    render(<MarketingHero eyebrow="Comparatif" title="Grand titre" subtitle="Sous-titre" />);
    expect(screen.getByText("Grand titre")).toBeInTheDocument();
    expect(screen.getByText("Sous-titre")).toBeInTheDocument();
    expect(screen.getByText("Comparatif")).toBeInTheDocument();
  });

  it("SectionHeader rend le titre", () => {
    render(<SectionHeader eyebrow="Avantages" title="Pourquoi Bizko" />);
    expect(screen.getByText("Pourquoi Bizko")).toBeInTheDocument();
  });

  it("CtaSection rend titre + 2 liens", () => {
    render(
      <CtaSection
        title="C'est parti"
        primary={{ href: "/signup", label: "Commencer" }}
        secondary={{ href: "/demo", label: "Voir la démo" }}
      />
    );
    expect(screen.getByText("C'est parti")).toBeInTheDocument();
    expect(screen.getByText("Commencer")).toHaveAttribute("href", "/signup");
    expect(screen.getByText("Voir la démo")).toHaveAttribute("href", "/demo");
  });

  it("FeatureCard rend icône, titre et explication", () => {
    render(<FeatureCard icon={<Check className="size-6" aria-hidden />} title="Rapide" description="Charge en 3G." />);
    expect(screen.getByText("Rapide")).toBeInTheDocument();
    expect(screen.getByText("Charge en 3G.")).toBeInTheDocument();
  });

  it("StatCard rend le chiffre et le libellé", () => {
    render(<StatCard value="68%" label="Utilisent WhatsApp" />);
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText("Utilisent WhatsApp")).toBeInTheDocument();
  });

  it("PricingCard populaire affiche un badge", () => {
    render(
      <PricingCard
        name="Pro"
        price="3000 F"
        features={["Domaine", "Analytics"]}
        popular
        ctaHref="/signup"
      />
    );
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Populaire")).toBeInTheDocument();
  });

  it("FaqItem rend numéro, question et réponse", () => {
    render(<FaqItem index={0} q="Question ?" a="Réponse." />);
    expect(screen.getByText("Question ?")).toBeInTheDocument();
    expect(screen.getByText("Réponse.")).toBeInTheDocument();
  });

  it("CompareTable affiche les colonnes et la ligne", () => {
    render(
      <CompareTable
        head={["Fonctionnalité", "Bizko", "Linktree", "Beacons"]}
        highlightColumn={1}
        rows={[
          {
            label: "Bouton WhatsApp",
            values: [
              <Check key="a" className="size-5 text-accent" aria-label="Oui" />,
              <X key="b" className="size-5 text-gray-300" aria-label="Non" />,
              <X key="c" className="size-5 text-gray-300" aria-label="Non" />,
            ],
          },
        ]}
      />
    );
    expect(screen.getByText("Bouton WhatsApp")).toBeInTheDocument();
    const heads = screen.getAllByRole("columnheader").map((th) => th.textContent);
    expect(heads).toContain("Bizko");
  });
});