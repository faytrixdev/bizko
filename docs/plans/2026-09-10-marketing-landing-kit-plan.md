# Landing Kit Marketing — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rendre les 3 pages marketing statiques (comparison, whatsapp-conversion, pricing-africa) modernes et premium via un kit de composants partagés aligné sur le design du blog, sans toucher au contenu ni au SEO.

**Architecture:** Un kit `src/components/marketing/` (Masthead, Hero, SectionHeader, FeatureCard, StatCard, PricingCard, FaqItem, CtaSection, CompareTable). Chaque page statique est réécrite pour composer ces composants. Zéro image, zéro JS dédié, pur CSS. SEO et métadonnées inchangés.

**Tech Stack:** Next.js 16.3.3 (App Router, Turbopack), Tailwind v4, lucide-react (déjà utilisé sur le blog), Vitest + @testing-library/react.

**Contraintes de style communes à utiliser partout :**
- Cartes : `rounded-3xl border border-border bg-white` ; hover `border-accent/40` + `shadow-[0_32px_64px_-32px_rgba(17,24,39,0.35)]` + transition `duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`.
- Eyebrow : `text-xs font-semibold uppercase tracking-[0.2em] text-accent`.
- H1 : `text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl`.
- Sections : `mx-auto max-w-6xl px-6` ; espacement `py-16 md:py-20` (bordure `border-b border-border/70` entre sections quand utile).
- Accent check : `text-accent`, pastille icône `flex size-12 items-center justify-center rounded-full bg-accent/10`.
- Token de bordure Tailwind utilisé sur le blog : `border-border`.

---

### Task 1: Composants de base du kit (Masthead, Hero, SectionHeader, CtaSection)

**Files:**
- Create: `src/components/marketing/MarketingMasthead.tsx`
- Create: `src/components/marketing/MarketingHero.tsx`
- Create: `src/components/marketing/SectionHeader.tsx`
- Create: `src/components/marketing/CtaSection.tsx`
- Create: `src/components/marketing/__tests__/kit.test.tsx`

**Step 1: Écrire les tests (rendus simples)**

```tsx
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
    render(<CtaSection title="C'est parti" primary={{ href: "/signup", label: "Commencer" }} secondary={{ href: "/demo", label: "Voir la démo" }} />);
    expect(screen.getByText("C'est parti")).toBeInTheDocument();
    expect(screen.getByText("Commencer")).toHaveAttribute("href", "/signup");
    expect(screen.getByText("Voir la démo")).toHaveAttribute("href", "/demo");
  });
});
```

**Step 2: Lancer la suite pour vérifier qu'elle échoue**

Run: `npm run test:run -- src/components/marketing/__tests__/kit.test.tsx`
Expected: FAIL (modules introuvables)

**Step 3: Implémenter les 4 composants**

`MarketingMasthead.tsx` :
```tsx
import Link from "next/link";

export function MarketingMasthead() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900">
          Bizko
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-hover"
        >
          Créer ma page
        </Link>
      </div>
    </header>
  );
}
```

`MarketingHero.tsx` :
```tsx
type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
};
import Link from "next/link";

export function MarketingHero({ eyebrow, title, subtitle, primary, secondary }: MarketingHeroProps) {
  return (
    <section className="border-b border-border/70">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">{subtitle}</p>
        {(primary || secondary) && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {primary && (
              <Link href={primary.href} className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-all duration-200 hover:bg-accent-hover">
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className="rounded-full border border-gray-300 px-8 py-3.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:border-gray-400 hover:bg-gray-50">
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
```

`SectionHeader.tsx` :
```tsx
type SectionHeaderProps = { eyebrow?: string; title: string; description?: string; align?: "center" | "left" };
import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title, description, align = "center" }: SectionHeaderProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-gray-600">{description}</p>}
    </div>
  );
}
```

`CtaSection.tsx` :
```tsx
import Link from "next/link";

type CtaSectionProps = { title: string; primary: { href: string; label: string }; secondary?: { href: string; label: string } };

export function CtaSection({ title, primary, secondary }: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center md:py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={primary.href} className="rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors duration-200 hover:bg-accent-hover">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
```

**Step 4: Lancer la suite pour vérifier qu'elle passe**

Run: `npm run test:run -- src/components/marketing/__tests__/kit.test.tsx`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/components/marketing
git commit -m "feat(marketing): kit de base masthead, hero, section, CTA"
```

---

### Task 2: Cartes du kit (FeatureCard, StatCard, PricingCard, FaqItem, CompareTable)

**Files:**
- Create: `src/components/marketing/FeatureCard.tsx`
- Create: `src/components/marketing/StatCard.tsx`
- Create: `src/components/marketing/PricingCard.tsx`
- Create: `src/components/marketing/FaqItem.tsx`
- Create: `src/components/marketing/CompareTable.tsx`
- Modify: `src/components/marketing/__tests__/kit.test.tsx` (append tests)

**Step 1: Étendre les tests**

```tsx
import type { ReactNode } from "react";
import { FeatureCard } from "../FeatureCard";
import { StatCard } from "../StatCard";
import { PricingCard } from "../PricingCard";
import { FaqItem } from "../FaqItem";
import { CompareTable } from "../CompareTable";
import { Check, X } from "lucide-react";

const Icon = () => <Check className="size-6" aria-hidden />;

it("FeatureCard rend icône, titre et explication", () => {
  render(<FeatureCard icon={<Icon />} title="Rapide" description="Charge en 3G." />);
  expect(screen.getByText("Rapide")).toBeInTheDocument();
  expect(screen.getByText("Charge en 3G.")).toBeInTheDocument();
});
it("StatCard rend le chiffre et le libellé", () => {
  render(<StatCard value="68%" label="Utilisent WhatsApp" />);
  expect(screen.getByText("68%")).toBeInTheDocument();
  expect(screen.getByText("Utilisent WhatsApp")).toBeInTheDocument();
});
it("PricingCard populaire affiche un badge", () => {
  render(<PricingCard name="Pro" price="3000 F" features={["Domaine", "Analytics"]} popular ctaHref="/signup" />);
  expect(screen.getByText("Pro")).toBeInTheDocument();
  expect(screen.getByText("Populaire")).toBeInTheDocument();
});
it("FaqItem rend numéro, question et réponse", () => {
  render(<FaqItem index={0} q="Question ?" a="Réponse." />);
  expect(screen.getByText("Question ?")).toBeInTheDocument();
  expect(screen.getByText("Réponse.")).toBeInTheDocument();
});
it("CompareTable met en avant la colonne Bizko", () => {
  render(
    <CompareTable
      head={["Fonctionnalité", "Bizko", "Linktree", "Beacons"]}
      highlightColumn={1}
      rows={[
        { label: "Bouton WhatsApp", values: [<Check key="a" className="size-5 text-accent" />, <X key="b" className="size-5 text-gray-300" />, <X key="c" className="size-5 text-gray-300" />] },
      ]}
    />
  );
  expect(screen.getByText("Bouton WhatsApp")).toBeInTheDocument();
  const heads = screen.getAllByRole("columnheader").map((th) => th.textContent);
  expect(heads).toContain("Bizko");
});
```

**Step 2: Vérifier l'échec puis implémenter**

Run: `npm run test:run -- src/components/marketing/__tests__/kit.test.tsx`
Expected: FAIL (modules manquants)

`FeatureCard.tsx` :
```tsx
import type { ReactNode } from "react";

export function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-white p-7 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_32px_64px_-32px_rgba(17,24,39,0.35)]">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}
```

`StatCard.tsx` :
```tsx
export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-7 text-center">
      <div className="text-4xl font-semibold tracking-tight text-accent">{value}</div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{label}</p>
    </div>
  );
}
```

`PricingCard.tsx` :
```tsx
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingCard({
  name, price, note, features, popular = false, ctaHref, ctaLabel = "Choisir ce plan",
}: {
  name: string; price: string; note?: string; features: string[]; popular?: boolean;
  ctaHref: string; ctaLabel?: string;
}) {
  return (
    <div className={cn("flex flex-col rounded-3xl border bg-white p-8",
      popular ? "border-accent shadow-[0_32px_64px_-32px_rgba(255,107,53,0.5)]" : "border-border")}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-gray-900">{name}</h3>
        {popular && (
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">Populaire</span>
        )}
      </div>
      <div className="mt-5">
        <span className="text-4xl font-semibold tracking-tight text-gray-900">{price}</span>
        {note && <p className="mt-1 text-sm text-gray-500">{note}</p>}
      </div>
      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" /> {f}
          </li>
        ))}
      </ul>
      <Link href={ctaHref} className={cn("mt-8 rounded-full py-3 text-center text-sm font-semibold transition-colors duration-200",
        popular ? "bg-accent text-white hover:bg-accent-hover" : "border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50")}>
        {ctaLabel}
      </Link>
    </div>
  );
}
```

`FaqItem.tsx` :
```tsx
export function FaqItem({ index, q, a }: { index: number; q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-border p-6">
      <h3 className="flex gap-3 text-lg font-semibold tracking-tight text-gray-900">
        <span className="font-mono text-sm font-medium text-accent">{String(index + 1).padStart(2, "0")}</span>
        {q}
      </h3>
      <p className="mt-2 pl-8 leading-relaxed text-gray-600">{a}</p>
    </div>
  );
}
```

`CompareTable.tsx` :
```tsx
import type { ReactNode } from "react";

export function CompareTable({
  head, highlightColumn, rows,
}: {
  head: string[]; highlightColumn: number; rows: { label: string; values: ReactNode[] }[];
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-white">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/60">
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={i === 0
                ? "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                : "px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={row.label} className="transition-colors duration-200 hover:bg-muted/40">
              <td className="px-6 py-5 font-medium text-gray-900 whitespace-nowrap">{row.label}</td>
              {row.values.map((value, i) => (
                <td key={i} className={i === highlightColumn ? "px-6 py-5 bg-accent/5" : "px-6 py-5"}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 3: Lancer les tests (PASS) puis commit**

Run: `npm run test:run -- src/components/marketing/__tests__/kit.test.tsx`
Expected: PASS (9 tests)

```bash
git add src/components/marketing
git commit -m "feat(marketing): cartes feature, stat, prix, FAQ et tableau comparatif"
```

---

### Task 3: Page `/whatsapp-conversion`

**Files:**
- Rewrite: `src/app/whatsapp-conversion/page.tsx`
- Test: `src/app/whatsapp-conversion/__tests__/page.test.tsx`

**Step 1: Test de smoke (meta + sections clés)**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsAppConversionPage } from "../page";

vi.mock("@/lib/i18n/messages-server", () => ({
  getServerMessages: async () => ({ whatsappConversion: { title: "T", description: "D" } }),
}));

describe("WhatsAppConversionPage", () => {
  it("affiche le H1 et la section CTA", async () => {
    const { container } = render(await WhatsAppConversionPage());
    expect(container.querySelector("h1")).not.toBeNull();
    expect(screen.getByText("Commencer")).toBeInTheDocument();
  });
});
```

> Si l'export par défaut rend le test du composant délicat, extraire l'UI dans `WhatsAppConversionView` (export nommé) et le wrapper `<Page>` (export par défaut) ; le test cible `WhatsAppConversionView`.

**Step 2: Réécrire la page** — Masthead → `MarketingHero` (titre/description actuels, primary=/signup) → 3 `StatCard` (contenu des 3 cartes actuelles « Adoption massive », « Préférence pour les affaires », « Taux d'ouverture élevé ») → 2 colonnes Sans/Avec Bizko (cartes bordées, tons rouge doux / vert doux) → 4 étapes numérotées (grands numéros mono accent) → `CtaSection` (« Commencer gratuitement » / « Voir la démo »). Conserver `generateMetadata` avec `msg.whatsappConversion?.title` + fallback et canonical exact.

**Step 3: Tests PASS + commit**

Run: `npm run test:run -- src/app/whatsapp-conversion && npm run build`
Expected: PASS puis build OK

```bash
git add src/app/whatsapp-conversion
git commit -m "feat(marketing): redesign page whatsapp-conversion"
```

---

### Task 4: Page `/comparison`

**Files:**
- Rewrite: `src/app/comparison/page.tsx`
- Test: `src/app/comparison/__tests__/page.test.tsx`

**Step 1: Idem Task 3** : smoke test (H1, bouton CTA, ligne « Bouton WhatsApp contextuel » dans le tableau).

**Step 2: Réécrire la page** — Masthead → `MarketingHero` → `CompareTable` (7 lignes existantes × 5 colonnes, `highlightColumn={1}` pour Bizko, contenu SVG/texte inchangé) → `SectionHeader` + 5 `FeatureCard` (avantages existants avec icônes lucide) → `CtaSection`. Conserver `generateMetadata` (msg.comparison) + canonical.

**Step 3: Tests PASS + build + commit**

```bash
git commit -m "feat(marketing): redesign page comparison"
```

---

### Task 5: Page `/pricing-africa`

**Files:**
- Rewrite: `src/app/pricing-africa/page.tsx`
- Test: `src/app/pricing-africa/__tests__/page.test.tsx`

**Step 1: Idem Task 3** : smoke test (H1, un plan tarifaire, bouton CTA).

**Step 2: Réécrire la page** — Masthead → `MarketingHero` → 3 `PricingCard` (contenus/tarifs existants, le plan mis en avant avec `popular`) → 6 `FeatureCard` (avantages existants) → FAQ avec 4 `FaqItem` → `CtaSection`. Conserver `generateMetadata` (msg.pricingAfrica) + canonical.

**Step 3: Tests PASS + build + commit**

```bash
git commit -m "feat(marketing): redesign page pricing-africa"
```

---

### Task 6: Vérifications finales

**Step 1: Suite complète**

Run: `npm run test:run`
Expected: PASS (rien de cassé en dehors du kit)

**Step 2: Build de production**

Run: `npm run build`
Expected: compilé, aucune erreur TS. On retrouve `/comparison`, `/whatsapp-conversion`, `/pricing-africa` dans les routes.

**Step 3: Revue du diff**

- Aucune modification de `messages/*.json`, `sitemap.ts`, `globals.css`, du pipeline blog.
- Les 3 pages gardent leur canonical et leurs métadonnées.
- Aucune image externe ajoutée, aucun composant client ajouté (sauf si nécessaire pour le partage déjà en place).

**Step 4: Commit final**

```bash
git add .
git commit -m "docs: plan du Landing Kit marketing"
```
(pas de commit si rien à ajouter)

---

## Rappels

- Le `Masthead` du blog (BlogMasthead) est laissé tel quel ; `MarketingMasthead` est dédié aux pages statiques.
- Contenu, textes, tarifs et structure correspondent à l'existant : ne rien inventer, reporter en commentaire toute incohérence repérée.
- Voix : tutoiement, pas d'emojis, pas de tiret cadratin « — » dans les textes ajoutés.