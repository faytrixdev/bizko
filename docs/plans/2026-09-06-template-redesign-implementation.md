# Refonte visuelle des 6 templates — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refondre les 6 templates Bizko (2 free + 4 pro) pour casser l'effet « boilerplate » : layouts internes uniques, palettes ancrées ouest-africaines, typographies hiérarchisées, composants (cartes/témoignages/socials) distincts par template — **en conservant le cadre centré** (colonnes centrées, blocs empilés).

**Architecture:** Chaque template est un composant autonome rendu dans une colonne `max-w-md` centrée par le renderer (`ProfileView`/`DemoProfileView`). Le fond de page est fourni par `BG_CLASS` dans `src/lib/templates.ts`. On réécrit le JSX de chaque template (palette/typo/composants locaux au composant), on adapte les smoke tests, et on remplace les visuels demo (avatars IA africains fournis par l'utilisateur + portfolio africain Unsplash).

**Tech Stack:** Next.js 16, Tailwind CSS 4, React 19, TypeScript, Vitest + Testing Library, `next/image`, lucide-react.

**Références de design :** voir `docs/plans/2026-09-06-template-redesign-design.md` (validé).

---

## Conventions communes au plan

- **Clé voix** : `Avatar`, `initials`, `formatTestimonialDate` depuis `./shared` (inchangé). Les templates définissent leur propre rendu de témoignages/socials (on n'utilise plus la carte générique `TestimonialCard` ni `PortfolioGallery` sauf mention).
- **`data-testid`** : chaque template ajoute des marqueurs de section pour des tests robustes : `t-name`, `hp-name`, `services`, `portfolio`, `testimonials`, `socials`, `cta-wa`.
- **Icône whatsapp** : `SocialIcon` depuis `@/components/socialIcons`. Icône téléphone : SVG en ligne (dupliqué, inchangé).
- **Bouton WhatsApp** : couleur produit `#25D366` conservée comme constante, style par template.
- **Colorants per-template** (arbitrary Tailwind) ; PAS de modification de `globals.css` sauf ajout de font.
- **Tests** : les asserts existants (noms, textes de section) restent ; on ajoute des asserts structurels (`data-testid`, classes clés).
- **Commandes** :
  - Test d'un fichier : `npx vitest run src/components/templates/__tests__/<Template>Template.test.tsx`
  - Vérif globale : `npm run test:run` puis `npx tsc --noEmit` puis `npm run build`

---

### Task 1: MinimalTemplate — « Signature »

**Files:**
- Modify: `src/components/templates/MinimalTemplate.tsx` (réécrire entièrement)
- Test: `src/components/templates/__tests__/MinimalTemplate.test.tsx`

**Step 1: Write the failing test**

Remplace le contenu du test par :

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MinimalTemplate } from "../MinimalTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("MinimalTemplate", () => {
  it("renders identity, contact, services, portfolio and socials", () => {
    const { container } = render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("uses the Signature language: large display name, hairline-divided services, no gray cards", () => {
    const { container } = render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByTestId("t-name").classList.contains("text-5xl")).toBe(true);
    const services = screen.getByTestId("services");
    expect(services.classList.contains("divide-y")).toBe(true);
    expect(services.querySelectorAll("[class*='rounded-2xl']").length).toBe(0);
    const socials = container.querySelector("[data-testid='socials']");
    expect(socials).not.toBeNull();
    expect(screen.getByTestId("cta-wa").getAttribute("href")).toBe("https://wa.me/2250700000000?text=hi");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/MinimalTemplate.test.tsx`
Expected: FAIL — `t-name`/`services`/`cta-wa` testid introuvables.

**Step 3: Write the new template**

Réécris `MinimalTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const Phone = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export function MinimalTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  const stars = (t: (typeof testimonials)[number]) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={i < (t.rating ?? 0) ? "h-3.5 w-3.5 fill-amber-500 text-amber-500" : "h-3.5 w-3.5 text-gray-300"} />
    ));

  return (
    <>
      {/* Header — Signature */}
      <div className="flex flex-col items-center text-center">
        <Avatar profile={profile} className="h-24 w-24 ring-1 ring-black/5 shadow-sm" />
        <h1 data-testid="t-name" className="mt-6 text-5xl font-semibold tracking-tighter text-gray-900 font-display leading-none">
          {profile.display_name}
        </h1>
        <p className="mt-3 text-base font-medium text-accent">{profile.tagline}</p>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && (
          <p className="mt-6 max-w-md text-base leading-8 text-gray-600">{profile.bio}</p>
        )}
        <div className="mt-8 w-full max-w-[400px] flex flex-col gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="h-14 w-full rounded-full bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-whatsapp-hover">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp} — {profile.display_name.split(" ")[0]}
          </a>
          <a href={links.telLink} className="h-12 w-full rounded-full border border-gray-300 text-gray-700 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-50">
            <Phone />
            {msg.call}
          </a>
        </div>
      </div>

      {/* Services — liste éditoriale à filets */}
      {services.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.services}</h2>
          <div data-testid="services" className="mt-4 border-t border-gray-200 divide-y divide-gray-200">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="py-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[17px] font-medium text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm leading-6 text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-semibold text-accent">{s.price.toLocaleString()} {s.currency}</p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-medium text-gray-500 underline underline-offset-4 transition-colors hover:text-accent">
                      {msg.demandBtn} →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-3 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — blocs éditoriaux */}
      {testimonials.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">{stars(t)}</div>
                </div>
                <p className="mt-2 text-[15px] leading-7 text-gray-700">« {t.content} »</p>
                <p className="mt-2 text-xs font-semibold text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-0.5 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials — lignes */}
      {socials.length > 0 && (
        <section className="mt-12">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 border-y border-gray-200 divide-y divide-gray-200">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/MinimalTemplate.test.tsx`
Expected: PASS (2 tests).

**Step 5: Commit**

```bash
git add src/components/templates/MinimalTemplate.tsx src/components/templates/__tests__/MinimalTemplate.test.tsx
git commit -m "feat(templates): redesign Minimal as pure Signature layout"
```

---

### Task 2: PortfolioTemplate — « Galerie » + fond papier

**Files:**
- Modify: `src/components/templates/PortfolioTemplate.tsx` (réécrire)
- Modify: `src/lib/templates.ts:38-45` (BG_CLASS portfolio → `bg-[#FAFAF6]`)
- Test: `src/components/templates/__tests__/PortfolioTemplate.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PortfolioTemplate } from "../PortfolioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("PortfolioTemplate", () => {
  it("renders identity, contact, services and socials", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText(/Awa Konaté/, { selector: "h1" })).toBeInTheDocument();
  });

  it("is gallery-first: portfolio is present and services stay compact", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    const portfolio = screen.getByTestId("portfolio");
    expect(portfolio).not.toBeNull();
    expect(screen.getByTestId("services").classList.contains("grid")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/PortfolioTemplate.test.tsx`
Expected: FAIL — testids `portfolio`/`services` manquants.

**Step 3: Implement**

Réécris `PortfolioTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Star } from "lucide-react";
import { formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const Phone = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export function PortfolioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — compact, galerie d'abord */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 text-left">
          <Avatar className="h-16 w-16 shrink-0 ring-1 ring-stone-200 shadow-sm" profile={profile} />
          <div className="min-w-0">
            <h1 data-testid="hp-name" className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
            <p className="text-sm font-medium text-[#B45309]">{profile.tagline}</p>
            <p className="mt-0.5 text-xs text-gray-400">{profile.city}, {profile.country}</p>
          </div>
        </div>
        {profile.bio && <p className="mt-6 max-w-md text-sm leading-7 text-gray-600">{profile.bio}</p>}
        <div className="mt-6 flex gap-3 w-full max-w-[400px]">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-2xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 transition-colors hover:bg-whatsapp-hover">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-2xl border border-stone-300 bg-white text-gray-600 inline-flex items-center justify-center transition-colors hover:bg-stone-100">
            <Phone />
          </a>
        </div>
      </div>

      {/* Services — compacts, ne volent pas la vedette */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.services}</h2>
          <div data-testid="services" className="mt-3 grid gap-2">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    {s.description && <p className="line-clamp-1 text-xs text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-sm font-bold text-[#B45309]">{s.price.toLocaleString()} {s.currency}</p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-gray-500 underline underline-offset-4 hover:text-[#B45309]">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — la star */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-3 grid grid-cols-3 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-white ${i % 4 === 0 ? "col-span-3 aspect-[16/10]" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — pull-quotes */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border-l-4 border-[#B45309] bg-white px-4 py-4 shadow-sm">
                <p className="text-sm leading-6 text-gray-700">« {t.content} »</p>
                <p className="mt-2 text-xs font-semibold text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-0.5 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 grid gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-stone-300 hover:text-[#B45309]">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

> Note : le fixture a `portfolio` avec 1 seul item → `i%4===0` → pleine largeur. OK.

Changé dans `src/lib/templates.ts` :
- ligne 40 : `portfolio: "bg-white"` → `portfolio: "bg-[#FAFAF6]"`

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/templates/__tests__/PortfolioTemplate.test.tsx`
Expected: PASS (2 tests).

**Step 5: Commit**

```bash
git add src/components/templates/PortfolioTemplate.tsx src/components/templates/__tests__/PortfolioTemplate.test.tsx src/lib/templates.ts
git commit -m "feat(templates): redesign Portfolio gallery-first on paper bg"
```

---

### Task 3: StudioTemplate — « Noir Éditorial »

**Files:**
- Modify: `src/components/templates/StudioTemplate.tsx` (réécrire)
- Test: `src/components/templates/__tests__/StudioTemplate.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StudioTemplate } from "../StudioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("StudioTemplate", () => {
  it("renders dark editorial hero with identity and contact", () => {
    render(<StudioTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("has a black hero with lime accent and ruled sections", () => {
    const { container } = render(<StudioTemplate {...makeTemplateProps()} />);
    const hero = container.querySelector("header");
    expect(hero?.classList.contains("bg-[#0A0A0A]")).toBe(true);
    expect(screen.getByText(msgServices())).toBeInTheDocument();
    const name = screen.getByText("Awa Konaté");
    expect(name.classList.contains("uppercase")).toBe(true);
  });
});

function msgServices() {
  return "Mes services";
}
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/StudioTemplate.test.tsx`
Expected: FAIL — `header` n'a pas `bg-[#0A0A0A]` (l'attribut est sur `header` déjà, mais le test actuel casse à cause de la taille du nom `text-5xl`). En réalité le assert premier passe, le deuxième teste `uppercase` sur le nom et échoue tant que le nouveau markup n'est pas en place (nom en Garamond).

**Step 3: Implement**

Réécris `StudioTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const LIME = "#D9FF4C";

export function StudioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Hero — Noir Éditorial */}
      <header className="bg-[#0A0A0A] px-4 py-14 text-center text-white">
        <Avatar profile={profile} className="h-24 w-24 ring-1 ring-white/20" />
        <h1 data-testid="t-name" style={CONDENSED} className="mt-6 text-5xl font-bold uppercase leading-[0.9] text-white">
          {profile.display_name}
        </h1>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: LIME }}>{profile.tagline}</p>
        <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/70">{profile.bio}</p>}
        <div className="mx-auto mt-8 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-14 flex-1 items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-black transition-colors hover:brightness-95" style={{ backgroundColor: LIME }}>
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-14 w-14 items-center justify-center text-white transition-colors hover:bg-white/10" style={{ border: "1px solid rgba(255,255,255,0.3)" }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — rangées rulées */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.services}</h2>
          <div data-testid="services" className="mt-4 border-t-2 border-gray-900">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 border-b border-gray-200 py-5">
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-1 text-sm leading-6 text-gray-500">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-xl font-bold text-gray-900">{s.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs font-bold uppercase tracking-widest text-gray-900 underline decoration-2 underline-offset-4 transition-colors hover:text-gray-500">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — B&W, hover couleur */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-2 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-[3/4] overflow-hidden bg-gray-100 grayscale transition-all duration-300 hover:grayscale-0">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — blocs rulés */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-5">
            {testimonials.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-900 pl-4">
                <p className="text-sm leading-6 text-gray-700">{t.content}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
                {t.createdAt && <p className="mt-1 text-[11px] text-gray-400">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center text-gray-700 transition-colors hover:bg-gray-900 hover:text-white" style={{ border: "1px solid #d1d5db" }}>
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

> Attention : `Avatar` doit être importé (utilisé dans le hero). Vérifie l'import : rescale `Avatar, formatTestimonialDate` depuis `./shared`.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/StudioTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/StudioTemplate.tsx src/components/templates/__tests__/StudioTemplate.test.tsx
git commit -m "feat(templates): redesign Studio as black editorial with lime accent"
```

---

### Task 4: EditoTemplate — « Magazine de luxe »

**Files:**
- Modify: `src/components/templates/EditoTemplate.tsx` (réécrire)
- Test: `src/components/templates/__tests__/EditoTemplate.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EditoTemplate } from "../EditoTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("EditoTemplate", () => {
  it("renders serif editorial identity and contact", () => {
    render(<EditoTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("wraps the bio in a pull-quote blockquote", () => {
    const { container } = render(<EditoTemplate {...makeTemplateProps()} />);
    const quote = container.querySelector("blockquote");
    expect(quote).not.toBeNull();
    expect(quote?.textContent).toContain("Je capture les moments qui comptent.");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/EditoTemplate.test.tsx`
Expected: FAIL — `blockquote` inexistant (le bio actuel est en `<blockquote>`, mais le test « 01 » échoue car pas de numérotation).

**Step 3: Implement**

Réécris `EditoTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" };

const pad = (n: number) => String(n + 1).padStart(2, "0");

export function EditoTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Magazine */}
      <header className="pt-4 text-center">
        <Avatar profile={profile} className="h-20 w-20 ring-4 ring-[#FAF7F2] shadow-sm" />
        <h1 data-testid="t-name" style={SERIF} className="mt-5 text-4xl font-medium text-[#1C1917] sm:text-5xl">
          {profile.display_name}
        </h1>
        <p className="mt-2 text-sm italic text-[#B07D3D]">{profile.tagline}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#1C1917]/50">{profile.city}, {profile.country}</p>
        {profile.bio && (
          <blockquote style={SERIF} className="mx-auto mt-8 max-w-md border-y border-[#B07D3D]/30 px-2 py-6 text-lg leading-8 text-[#1C1917]/80">
            « {profile.bio} »
          </blockquote>
        )}
        <div className="mx-auto mt-8 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#B07D3D] font-medium text-white transition-colors hover:bg-[#96702f]">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1C1917]/20 text-[#1C1917] transition-colors hover:bg-[#1C1917]/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — menu numéroté */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.services}</h2>
          <div data-testid="services" className="mt-5">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="flex items-baseline gap-3 border-b border-[#1C1917]/10 py-4">
                  <span style={SERIF} className="text-sm italic text-[#B07D3D]">{pad(i)}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-[#1C1917]">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-[#1C1917]/55">{s.description}</p>}
                  </div>
                  <span className="flex-1 border-b border-dotted border-[#1C1917]/25" aria-hidden="true" />
                  {s.price != null && <p style={SERIF} className="shrink-0 text-lg text-[#B07D3D]">{s.price.toLocaleString()} <span className="text-xs">{s.currency}</span></p>}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="ml-1 shrink-0 text-xs font-medium text-[#B07D3D] underline underline-offset-4 hover:text-[#96702f]">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — figures */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-5 grid grid-cols-2 gap-4">
            {portfolio.map((p) => (
              <figure key={p.id} className="text-center">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE9DD]">
                  <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
                </div>
                {p.title && <figcaption style={SERIF} className="mt-2 text-sm italic text-[#1C1917]/70">{p.title}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — citations serif */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-5 flex flex-col gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="border-y border-[#B07D3D]/25 py-5 text-center">
                <p style={SERIF} className="text-lg italic leading-8 text-[#1C1917]/80">« {t.content} »</p>
                <footer className="mt-3 text-xs font-medium text-[#1C1917]/60">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</footer>
                {t.createdAt && <p className="mt-1 text-[11px] text-[#1C1917]/40">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* Socials — text links */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.socials}</h2>
          <div data-testid="socials" className="mt-3 flex flex-col">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border-b border-[#1C1917]/10 py-2.5 text-sm font-medium text-[#1C1917] transition-colors hover:text-[#B07D3D]">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/EditoTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/EditoTemplate.tsx src/components/templates/__tests__/EditoTemplate.test.tsx
git commit -m "feat(templates): redesign Edito as luxury serif magazine"
```

---

### Task 5: UrbanTemplate — « Collage vivant »

**Files:**
- Modify: `src/components/templates/UrbanTemplate.tsx` (réécrire)
- Test: `src/components/templates/__tests__/UrbanTemplate.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { UrbanTemplate } from "../UrbanTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("UrbanTemplate", () => {
  it("renders energetic identity and contact", () => {
    render(<UrbanTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });

  it("uses the collage language: gradient avatar ring and flat colored service panels (no gray borders)", () => {
    const { container } = render(<UrbanTemplate {...makeTemplateProps()} />);
    const ring = container.querySelector("[data-testid='avatar-ring']");
    expect(ring?.classList.contains("from-[#7C3AED]")).toBe(true);
    const service = screen.getByText("Séance studio").closest("[data-testid='service-item']");
    expect(service?.classList.contains("rounded-3xl")).toBe(true);
    expect(service && [...service.classList].some((c) => c.startsWith("bg-[#"))).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/UrbanTemplate.test.tsx`
Expected: FAIL — `avatar-ring` et `service-item` manquants.

**Step 3: Implement**

Réécris `UrbanTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Star } from "lucide-react";
import { initials, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const DISPLAY = { fontFamily: "var(--font-sora, ui-sans-serif, sans-serif)" };
const PANELS = [
  { bg: "bg-[#F3E8FF]", chip: "bg-white/80 text-[#7C3AED]" },
  { bg: "bg-[#FEF3C7]", chip: "bg-white/80 text-[#B45309]" },
  { bg: "bg-[#CFFAFE]", chip: "bg-white/80 text-[#0891B2]" },
  { bg: "bg-[#FCE7F3]", chip: "bg-white/80 text-[#DB2777]" },
];

export function UrbanTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Collage */}
      <header className="pt-2 text-center">
        {profile.avatar_url ? (
          <div data-testid="avatar-ring" className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#312E81] to-[#F59E0B] p-[3px] shadow-lg shadow-[#7C3AED]/25">
            <Image src={profile.avatar_url} alt={profile.display_name} width={104} height={104} className="h-full w-full rounded-full object-cover ring-4 ring-white" />
          </div>
        ) : (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] via-[#312E81] to-[#F59E0B] p-[3px]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold text-[#7C3AED]">{initials(profile.display_name)}</div>
          </div>
        )}
        <h1 data-testid="t-name" style={DISPLAY} className="mt-5 text-4xl font-bold tracking-tight text-gray-900">
          {profile.display_name}
        </h1>
        <span className="mt-3 inline-flex items-center rounded-full bg-[#7C3AED] px-4 py-1.5 text-xs font-bold text-white">{profile.tagline}</span>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-gray-600">{profile.bio}</p>}
        <div className="mx-auto mt-7 flex w-full max-w-[400px] gap-3">
          <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#312E81] text-white shadow-lg shadow-[#7C3AED]/30 transition-opacity hover:opacity-90">
            <SocialIcon platform="whatsapp" className="h-4 w-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="flex h-13 w-13 items-center justify-center rounded-full border-2 border-[#7C3AED]/20 text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — panneaux couleur pleine */}
      {services.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.services}</h2>
          <div data-testid="services" className="mt-4 flex flex-col gap-3">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              const panel = PANELS[i % PANELS.length];
              return (
                <div key={s.id} data-testid="service-item" className={`flex items-center justify-between gap-4 rounded-3xl px-5 py-4 ${panel.bg}`}>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-gray-600">{s.description}</p>}
                    <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${panel.chip}`}>
                      {s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : msg.demandBtn}
                    </span>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`flex h-9 shrink-0 items-center rounded-full px-4 text-xs font-bold text-white transition-opacity hover:opacity-90 ${i % 2 === 0 ? "bg-gray-900" : "bg-[#7C3AED]"}`}>{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-2 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-3xl ${i % 3 === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials — bulles */}
      {testimonials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-3xl bg-[#F3E8FF] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#7C3AED]">{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{t.authorName}</p>
                  {t.rating != null && (
                    <div aria-label={msg.testimonials.starsAria} className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < (t.rating ?? 0) ? "h-3.5 w-3.5 fill-amber-500 text-amber-500" : "h-3.5 w-3.5 text-white/70"} />)}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700">{t.content}</p>
                {t.createdAt && <p className="mt-2 text-[11px] text-gray-500">{formatTestimonialDate(locale, t.createdAt)}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials — cercles dégradés */}
      {socials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 flex flex-wrap gap-3">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#312E81] text-white transition-transform hover:scale-105">
                <SocialIcon platform={s.platform} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

> Note : `h-13`/`w-13` ne sont pas des utilitaires Tailwind par défaut. Utilise `h-12`/`w-12` (comme les autres CTA) pour éviter une classe morte. Remplace `h-13 flex-1` → `h-12 flex-1` et `w-13` → `w-12`.

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/UrbanTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/UrbanTemplate.tsx src/components/templates/__tests__/UrbanTemplate.test.tsx
git commit -m "feat(templates): redesign Urban as vibrant collage"
```

---

### Task 6: ObsidienneTemplate — « Club noir profond »

**Files:**
- Modify: `src/components/templates/ObsidienneTemplate.tsx` (réécrire)
- Test: `src/components/templates/__tests__/ObsidienneTemplate.test.tsx`

**Step 1: Write the failing test**

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObsidienneTemplate } from "../ObsidienneTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("ObsidienneTemplate", () => {
  it("renders dark luxury identity and contact", () => {
    const { container } = render(<ObsidienneTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByTestId("halo")).not.toBeNull();
  });

  it("uses glass panels for services with gold accent", () => {
    render(<ObsidienneTemplate {...makeTemplateProps()} />);
    const service = screen.getByText("Séance studio").closest("[data-testid='service-item']");
    expect(service?.classList.contains("backdrop-blur-md")).toBe(true);
    expect(service?.classList.contains("border-white/10")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/ObsidienneTemplate.test.tsx`
Expected: FAIL — `halo` et `service-item` manquants.

**Step 3: Implement**

Réécris `ObsidienneTemplate.tsx` :

```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" };
const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const GOLD = "#D4AF37";
const GOLD_SOFT = "#E6C87A";

export function ObsidienneTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header — Club noir */}
      <header className="pt-2 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="h-1.5 w-16 bg-[#D4AF37]" aria-hidden="true" />
          <div className="relative mt-8" data-testid="halo">
            <div aria-hidden="true" className="absolute -inset-4 rounded-full bg-[#D4AF37]/30 blur-2xl" />
            <Avatar profile={profile} className="relative h-28 w-28 ring-1 ring-[#D4AF37]/50" />
          </div>
          <h1 data-testid="t-name" style={SERIF} className="mt-6 text-4xl font-medium tracking-wide text-white sm:text-5xl">
            {profile.display_name}
          </h1>
          <p className="mt-2 text-sm font-medium" style={{ color: GOLD }}>{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-5 max-w-md text-sm leading-7 text-white/60">{profile.bio}</p>}
          <div className="mt-8 flex w-full max-w-[400px] gap-3">
            <a data-testid="cta-wa" href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#E6C87A] font-bold text-black transition-opacity hover:opacity-90">
              <SocialIcon platform="whatsapp" className="h-4 w-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services — panneaux verre */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.services}</h2>
          <div data-testid="services" className="mt-4 flex flex-col gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} data-testid="service-item" className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{s.title}</p>
                    {s.description && <p className="mt-0.5 text-sm text-white/50">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold" style={{ color: GOLD }}>{s.price.toLocaleString()} <span className="text-xs font-medium text-white/50">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[#D4AF37] hover:text-black" style={{ borderColor: "rgba(212,175,55,0.6)", color: GOLD }}>
                      {msg.demandBtn}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — mosaïque */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.portfolio}</h2>
          <div data-testid="portfolio" className="mt-4 grid grid-cols-6 gap-2">
            {portfolio.map((p, i) => {
              const span = i % 4 === 0 ? "col-span-4" : i % 4 === 1 ? "col-span-2" : "col-span-3";
              return (
                <div key={p.id} className={`relative aspect-square overflow-hidden rounded-xl border border-white/10 ${span}`}>
                  <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 320px" className="object-cover" />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Testimonials — cartes sombres */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.testimonials.title}</h2>
          <div data-testid="testimonials" className="mt-4 flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold" style={{ color: GOLD }}>{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.authorName}</p>
                    {t.authorRole && <p className="truncate text-xs text-white/40">{t.authorRole}</p>}
                  </div>
                  {t.rating != null && <div role="img" aria-label={msg.testimonials.starsAria} style={{ color: GOLD }} className="text-xs">{"★".repeat(Math.max(1, Math.min(5, Math.round(t.rating))))}</div>}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">{t.content}</p>
                <p className="mt-3 text-[11px] text-white/30">{formatTestimonialDate(locale, t.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.socials}</h2>
          <div data-testid="socials" className="mt-4 grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/ObsidienneTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/ObsidienneTemplate.tsx src/components/templates/__tests__/ObsidienneTemplate.test.tsx
git commit -m "feat(templates): redesign Obsidienne as deep black luxury with gold"
```

---

### Task 7: Visuels demo — avatars africains + portfolio africain

> **Prérequis bloquant** : l'utilisateur génère les 6 avatars avec les prompts (design doc Section 5) et dépose les fichiers dans `public/avatars-demo/` (ex. `awa-diallo.jpg`, `mamadou-traore.jpg`, `yann-kouassi.jpg`, `clara-mensah.jpg`, `jules-zongo.jpg`, `nora-bamba.jpg`). Sans les fichiers, cette task est en pause.

**Files:**
- Create: `public/avatars-demo/*.jpg` (fournis par l'utilisateur)
- Modify: `src/app/demo/fixtures.ts` (map AVATARS + map P)
- Test: `src/app/demo/__tests__/DemoProfileView.test.tsx` (si existant) ou vérif manuelle

**Step 1: Vérifie le répertoire**

```bash
Get-ChildItem public/avatars-demo
```
Expected: 6 fichiers .jpg.

**Step 2: Mise à jour des avatars dans `fixtures.ts`**

Remplace la map `AVATARS` (lignes 39-46) pour pointer vers les fichiers locaux :

```ts
// Avatars générés par IA (prompts validés) — dépôt local.
const AVATARS = {
  minimal: "/avatars-demo/awa-diallo.jpg",
  portfolio: "/avatars-demo/mamadou-traore.jpg",
  studio: "/avatars-demo/yann-kouassi.jpg",
  edito: "/avatars-demo/clara-mensah.jpg",
  urban: "/avatars-demo/jules-zongo.jpg",
  obsidienne: "/avatars-demo/nora-bamba.jpg",
} as const;
```

> Les `avatar_url` des 6 profiles utilisent déjà `u(AVATARS.minimal, 400, 400)` etc. → ils deviennent `u("/avatars-demo/awa-diallo.jpg", 400, 400)` → `https://images.unsplash.com//avatars-demo/...` ! **Correction nécessaire** : utiliser `AVATARS.score` brut sans `u()`. Modifie les 6 `avatar_url` :

```ts
avatar_url: "/avatars-demo/awa-diallo.jpg", // minimal
avatar_url: "/avatars-demo/mamadou-traore.jpg", // portfolio
avatar_url: "/avatars-demo/yann-kouassi.jpg", // studio
avatar_url: "/avatars-demo/clara-mensah.jpg", // edito
avatar_url: "/avatars-demo/jules-zongo.jpg", // urban
avatar_url: "/avatars-demo/nora-bamba.jpg", // obsidienne
```

**Step 3: Contribution de la map `P` (portfolio) — visuels africains Unsplash**

L'utilisateur valide d'abord la sélection (liens) — voir design doc Section 6. Ensuite, remplace les valeurs de `P` (lignes 52-63) par des URLs Unsplash à contenu africain validées. Exemple de structure à garder :

```ts
const P = {
  wedding: PHOTO("photo-XXX-African-wedding", 800, 800),
  portrait: PHOTO("photo-XXX-African-portrait", 800, 800),
  studio: PHOTO("photo-XXX-camera", 800, 800),
  landscape: PHOTO("photo-XXX", 800, 800),
  interior: PHOTO("photo-XXX-African-interior", 800, 800),
  brand: PHOTO("photo-XXX-brand", 800, 800),
  fashion: PHOTO("photo-XXX-African-fashion", 800, 800),
  makeup: PHOTO("photo-XXX", 800, 800),
  street: PHOTO("photo-XXX-African-street-art", 800, 800),
  texture: PHOTO("photo-XXX-wax-fabric", 800, 800),
} as const;
```

> Pexels : si des images Pexels sont choisies, ajouter `images.pexels.com` aux `remotePatterns` de `next.config.ts` ET au CSP `img-src` (comme fait pour Unsplash).

**Step 4: Vérification**

- `npx vitest run src/app/demo` (si tests existants) puis `npm run test:run`
- `npm run build` (vérifie que `next/image` accepte les nouveaux domaines)

**Step 5: Commit**

```bash
git add public/avatars-demo src/app/demo/fixtures.ts next.config.ts
git commit -m "feat(demo): African AI avatars and African portfolio visuals"
```

---

### Task 8: Vérification finale + commit

**Files:** none (vérifications globales)

**Step 1: Suite complète**

Run: `npm run test:run`
Expected: PASS (181+ tests, 30+ fichiers).

**Step 2: Types**

Run: `npx tsc --noEmit`
Expected: exit 0.

**Step 3: Lint (nouveau code)**

Run: `npm run lint`
Expected: 8 erreurs pré-existantes inchangées (non liées), pas de nouvelle erreur dans `src/components/templates/`.

**Step 4: Build**

Run: `npm run build`
Expected: OK.

**Step 5: Commit final si sauts résiduels**

```bash
git add -A
git commit -m "chore(templates): post-redesign verification fixes" (si nécessaire)
```

---

## Risques & notes

- **`h-13`/`w-13`** : non standard Tailwind → toujours utiliser `h-12`/`w-12` ou une taille de la scale.
- **`Avatar` fallback** (initials sombres) : risqué sur fond sombre (Obsidienne/Studio dark) → acceptable en démo (avatars toujours fournis) ; si besoin, ajouter une prop `fallbackClassName` dans `shared.tsx` (hors périmètre sauf bug visible).
- **`next/image` avec fichiers locaux** : OK sans config. Avec Unsplash/Pexels : domaines dans `remotePatterns` + CSP.
- **Tests des 4 autres templates** : adapter chaque test pour les nouveaux `data-testid` (Tasks 1-6 couvrent Minimal/Portfolio/Studio/Edito/Urban/Obsidienne).
- **`TestimonialCard`** : reste dans le repo mais devient non utilisé par les templates. Ne pas supprimer tant que d'autres consommateurs existent (vérifier avec `rg "TestimonialCard"`).
- La migration SQL templates (`supabase/migrations/20250906000000_templates.sql`) reste **non appliquée** (Docker off) — hand-off indépendant.