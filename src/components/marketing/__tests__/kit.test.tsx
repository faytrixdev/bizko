import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarketingMasthead } from "../MarketingMasthead";
import { MarketingHero } from "../MarketingHero";
import { SectionHeader } from "../SectionHeader";
import { CtaSection } from "../CtaSection";

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
});