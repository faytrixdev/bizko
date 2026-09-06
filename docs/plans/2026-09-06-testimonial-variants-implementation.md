# Variantes de témoignages par template — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Différencier le bloc témoignages de chaque template (marquee auto-défilant, citation tournante, carousel avec flèches, grilles) en CSS pur, plus un composant client pour Obsidienne, sans casser les tests existants.

**Architecture:** 5 templates modifiés en JSX/CSS pures (`@keyframes` ajoutés dans `globals.css`). Un composant client `TestimonialCarousel` handle bord observable pour Obsidienne. Pas de lib d'animation ajoutée.

**Tech Stack:** Next.js (App Router), React TSX, Tailwind CSS (utilitaires + `@keyframes` dans `globals.css`), Vitest + Testing Library.

---

## Conventions stables (à respecter partout)

- **`data-testid="testimonials"` conservé** sur le conteneur de chaque template → les tests existants restent verts.
- Les templates sont des **composants serveur** ; les animations CSS (`@keyframes`) ne nécessitent aucun client. Seul `TestimonialCarousel` est `"use client"`.
- TDD : test d'abord, puis implémentation minimale.
- Commandes de vérification :
  - tests : `npx vitest run src/components/templates/__tests__/<Fichier>.test.tsx`
  - lint : `npx eslint <fichiers modifiés>`
  - global : `npm run test:run`, `npx tsc --noEmit`, `npm run build`

---

### Task 1: CSS des animations (`globals.css`)

**Files:**
- Modify: `src/app/globals.css` (append après le bloc `mockup-float` existant, ~ligne 83)

**Step 1: Écrire le code (pas de test ici — CSS pure)**

Ajouter en fin de fichier :

```css
/* Testimonial marquee (Studio / Urban) */
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee 22s linear infinite;
}
.marquee-track:hover,
.marquee-track:focus-within {
  animation-play-state: paused;
  animation-direction: reverse;
}

/* Testimonial crossfade (Édito) */
@keyframes fade-cycle {
  0%, 8%   { opacity: 1; }
  16%, 92% { opacity: 0; }
  100%     { opacity: 0; }
}
.fade-cycle-stage {
  position: relative;
}
.fade-cycle-item {
  width: 100%;
  opacity: 0;
  animation: fade-cycle var(--cycle, 24s) linear infinite;
  animation-delay: calc(var(--i, 0) * (var(--cycle, 24s) / var(--n, 4)));
}
.fade-cycle-item[aria-hidden="true"] {
  visibility: hidden;
}
```

**Step 2: Vérifier** — `git diff` : seul `globals.css` est touché.

**Step 3: Commit** — `git add src/app/globals.css && git commit -m "feat(templates): add marquee and crossfade keyframes for testimonial variants"`

---

### Task 2: Studio — bande auto-défilante horizontale

**Files:**
- Modify: `src/components/templates/StudioTemplate.tsx` (bloc `Testimonials`, lignes 73-87)

**Step 1: Rendu actuel → implémentation**

Remplacer le bloc `{/* Testimonials — blocs rulés */}` (lignes 73-87) par :

```tsx
{/* Testimonials — bande auto-défilante */}
{testimonials.length > 0 && (
  <section className="mt-10">
    <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400">{msg.testimonials.title}</h2>
    <div data-testid="testimonials" className="mt-4 overflow-hidden" aria-label={msg.testimonials.title}>
      <div className="marquee-track gap-4">
        {[...testimonials, ...testimonials].map((t, i) => (
          <div key={`${t.id}-${i}`} className="w-56 shrink-0 rounded-xl border border-white/10 bg-[#141414] p-4">
            <p className="text-sm leading-6 text-white/75">« {t.content} »</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-white">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</p>
            {t.createdAt && <p className="mt-1 text-[11px] text-white/40">{formatTestimonialDate(locale, t.createdAt)}</p>}
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

**Step 2: Vérifier** — `npx vitest run src/components/templates/__tests__/StudioTemplate.test.tsx` → 2 passed. Lint : `npx eslint src/components/templates/StudioTemplate.tsx` → 0 erreur.

**Step 3: Commit** — `git add src/components/templates/StudioTemplate.tsx && git commit -m "feat(templates): Studio testimonials as auto-scrolling marquee band"`

---

### Task 3: Urban — marquee rapide (bulles colorées)

**Files:**
- Modify: `src/components/templates/UrbanTemplate.tsx` (bloc `Testimonials — bulles`, lignes 88-110)

**Step 1: Implémentation**

Le bloc actuel utilise `flex flex-col gap-3` (ligne 92). Remplacer la structure par une bande défilante qui conserve la carte bulle existante (contenu de `.map` inchangé) :

```tsx
{/* Testimonials — marquee de bulles */}
{testimonials.length > 0 && (
  <section className="mt-9">
    <h2 style={DISPLAY} className="text-sm font-bold text-gray-900">{msg.testimonials.title}</h2>
    <div data-testid="testimonials" className="mt-4 overflow-hidden" aria-label={msg.testimonials.title}>
      <div className="marquee-track gap-3" style={{ animationDuration: "16s" }}>
        {[...testimonials, ...testimonials].map((t, i) => (
          <div key={`${t.id}-${i}`} className="w-64 shrink-0 rounded-3xl bg-[#F3E8FF] px-5 py-4">
            {/* corps de la carte existante (auteur, étoiles, contenu, date) */}
          </div>
        ))}
      </div>
    </div>
  </section>
)}
```

**Contenu de la carte** : reprendre exactement l'intérieur du bloc actuel (ligne 95-105) : pastille initiale, nom, étoiles, contenu, date.

**Step 2: Vérifier** — `npx vitest run src/components/templates/__tests__/UrbanTemplate.test.tsx` → 2 passed (tester son contenu est présent). Lint OK.

**Step 3: Commit** — `git add src/components/templates/UrbanTemplate.tsx && git commit -m "feat(templates): Urban testimonials as fast marquee of colored bubbles"`

---

### Task 4: Édito — citation tournante (crossfade)

**Files:**
- Modify: `src/components/templates/EditoTemplate.tsx` (bloc `Testimonials — citations serif`, lignes 81-95)

**Step 1: Implémentation**

Remplacer le bloc (lignes 81-95) par un stage en overlay avec crossfade CSS. Hauteur fixe → les cartes sont `absolute` :

```tsx
{/* Testimonials — citation tournante */}
{testimonials.length > 0 && (
  <section className="mt-10">
    <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.testimonials.title}</h2>
    <div data-testid="testimonials" className="fade-cycle-stage mt-5 h-40" aria-label={msg.testimonials.title}>
      {testimonials.map((t, i) => (
        <blockquote
          key={t.id}
          className={`fade-cycle-item absolute inset-0 border-y border-[#B07D3D]/25 py-5 text-center ${testimonials.length === 1 ? "opacity-100" : ""}`}
          style={{ "--i": i, "--n": testimonials.length } as React.CSSProperties}
          aria-hidden={testimonials.length === 1 ? undefined : i > 0}
        >
          <p style={SERIF} className="text-lg italic leading-8 text-[#1C1917]/80">« {t.content} »</p>
          <footer className="mt-3 text-xs font-medium text-[#1C1917]/60">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""}</footer>
          {t.createdAt && <p className="mt-1 text-[11px] text-[#1C1917]/40">{formatTestimonialDate(locale, t.createdAt)}</p>}
        </blockquote>
      ))}
    </div>
  </section>
)}
```

Note : si 1 seul témoignage → pas d'animation (classe `opacity-100`, `fade-cycle-item` neutralisée par inline style de durée sur n=1). Le test existant `screen.getByText("« ... »")` — vérifier quel texte est asserté.

**Step 2: Vérifier** — exécuter le test Édito existant :
- `npx vitest run src/components/templates/__tests__/EditoTemplate.test.tsx` — d'abord voir ce qu'il attend. Si le contenu du témoignage est asserté `getByText`, celui-ci reste présent dans le DOM (juste `opacity`/`aria-hidden`), donc il passe. Si besoin, adapter le test pour cibler `getByText` (pas `toBeVisible`) — **vérifier le fichier test avant de conclure**.

**Step 3: Commit** — `git add src/components/templates/EditoTemplate.tsx && git commit -m "feat(templates): Edito testimonials as rotating crossfade quote"`

---

### Task 5: Portfolio — grille 2 colonnes

**Files:**
- Modify: `src/components/templates/PortfolioTemplate.tsx` (bloc `Testimonials`, lignes 76-90)

**Step 1: Implémentation**

Remplacer le conteneur `flex flex-col gap-5` (ligne 80) par une grille 2 colonnes :

```tsx
<div data-testid="testimonials" className="mt-4 grid grid-cols-2 gap-3">
```

Le contenu de chaque carte (blanc, arrondi, padding) reste inchangé (lignes 82-86, sans le `border-l-4` déjà retiré).

**Step 2: Vérifier** — `npx vitest run src/components/templates/__tests__/PortfolioTemplate.test.tsx` → 2 passed. Lint OK.

**Step 3: Commit** — `git add src/components/templates/PortfolioTemplate.tsx && git commit -m "feat(templates): Portfolio testimonials as 2-column grid"`

---

### Task 6: Minimal — liste compacte

**Files:**
- Modify: `src/components/templates/MinimalTemplate.tsx` (bloc `Testimonials`, lignes 85-102)

**Step 1: Implémentation**

Réduire l'espacement vertical (gap-6 → gap-3), padding intérieur, et grouper auteur/date sur une ligne pour un rendu dense :

```tsx
<div data-testid="testimonials" className="mt-4 flex flex-col gap-3">
  {testimonials.map((t) => (
    <div key={t.id} className="border-l-2 border-gray-200 pl-3">
      <div className="flex items-center gap-2">{stars(t)}</div>
      <p className="mt-1.5 text-sm leading-6 text-gray-700">« {t.content} »</p>
      <p className="mt-1.5 text-xs font-semibold text-gray-900">{t.authorName}{t.authorRole ? ` · ${t.authorRole}` : ""} {t.createdAt && <span className="ml-1 font-normal text-gray-400">· {formatTestimonialDate(locale, t.createdAt)}</span>}</p>
    </div>
  ))}
</div>
```

**Step 2: Vérifier** — `npx vitest run src/components/templates/__tests__/MinimalTemplate.test.tsx` → 2 passed. Lint OK.

**Step 3: Commit** — `git add src/components/templates/MinimalTemplate.tsx && git commit -m "feat(templates): Minimal testimonials as compact list"`

---

### Task 7: Obsidienne — carousel avec flèches (composant client)

**Files:**
- Create: `src/components/templates/TestimonialCarousel.tsx`
- Modify: `src/components/templates/ObsidienneTemplate.tsx` (bloc `Testimonials`, lignes 85-106)

**Step 1: Écrire le test du composant**

Create: `src/components/templates/__tests__/TestimonialCarousel.test.tsx`

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TestimonialCarousel } from "../TestimonialCarousel";

afterEach(() => cleanup());

const items = [
  { id: "t1", authorName: "Mariam", authorRole: "Cliente", content: "Superbe", rating: 5, createdAt: "2026-08-01T00:00:00Z" },
  { id: "t2", authorName: "Ousmane", authorRole: null, content: "Parfait", rating: 4, createdAt: "2026-08-02T00:00:00Z" },
  { id: "t3", authorName: "Awa", authorRole: "Sœur", content: "Top", rating: 5, createdAt: "2026-08-03T00:00:00Z" },
];

const msg = { testimonials: { title: "Témoignages", starsAria: "Note" } } as any;

describe("TestimonialCarousel", () => {
  it("shows first testimonial and navigates forward", () => {
    render(<TestimonialCarousel testimonials={items} msg={msg} locale="fr" />);
    expect(screen.getByText("Superbe")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Suivant"));
    expect(screen.getByText("Parfait")).toBeInTheDocument();
  });

  it("wraps around from last to first", () => {
    render(<TestimonialCarousel testimonials={items} msg={msg} locale="fr" />);
    fireEvent.click(screen.getByLabelText("Précédent"));
    expect(screen.getByText("Top")).toBeInTheDocument();
  });

  it("shows a single testimonial without arrows", () => {
    render(<TestimonialCarousel testimonials={[items[0]]} msg={msg} locale="fr" />);
    expect(screen.queryByLabelText("Suivant")).not.toBeInTheDocument();
  });
});
```

**Step 2: exécuter le test → échec attendu** — `npx vitest run src/components/templates/__tests__/TestimonialCarousel.test.tsx` → "Cannot find module ../TestimonialCarousel".

**Step 3: Écrire le composant**

```tsx
"use client";
import { useState } from "react";
import type { PublicTestimonial } from "@/lib/supabase/queries";
import { formatTestimonialDate } from "./shared";

const GOLD = "#D4AF37";

export function TestimonialCarousel({ testimonials, msg, locale }: {
  testimonials: PublicTestimonial[];
  msg: { testimonials: { title: string; starsAria: string } };
  locale: string;
}) {
  const [index, setIndex] = useState(0);
  if (testimonials.length === 0) return null;
  const t = testimonials[index % testimonials.length];
  return (
    <div data-testid="testimonials" className="mt-4" aria-label={msg.testimonials.title}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
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
      {testimonials.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" aria-label="Précédent" onClick={() => setIndex((index - 1 + testimonials.length) % testimonials.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">←</button>
          <span className="text-[11px] uppercase tracking-widest text-white/40">{index + 1} / {testimonials.length}</span>
          <button type="button" aria-label="Suivant" onClick={() => setIndex((index + 1) % testimonials.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">→</button>
        </div>
      )}
    </div>
  );
}
```

**Step 4: exécuter le test → passe** — `npx vitest run src/components/templates/__tests__/TestimonialCarousel.test.tsx` → 3 passed.

**Step 5: Brancher dans ObsidienneTemplate**

Remplacer le bloc `Testimonials — cartes sombres` (lignes 85-106) par :

```tsx
{/* Testimonials — carousel */}
{testimonials.length > 0 && (
  <section className="mt-10">
    <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">{msg.testimonials.title}</h2>
    <TestimonialCarousel testimonials={testimonials} msg={msg} locale={locale} />
  </section>
)}
```

Ajouter l'import : `import { TestimonialCarousel } from "./TestimonialCarousel";`

**Step 6: Vérifier** — `npx vitest run src/components/templates/__tests__/ObsidienneTemplate.test.tsx` → 2 passed. Lint : `npx eslint src/components/templates/ObsidienneTemplate.tsx src/components/templates/TestimonialCarousel.tsx src/components/templates/__tests__/TestimonialCarousel.test.tsx`.

**Step 7: Commit** — `git add src/components/templates/TestimonialCarousel.tsx src/components/templates/__tests__/TestimonialCarousel.test.tsx src/components/templates/ObsidienneTemplate.tsx && git commit -m "feat(templates): Obsidienne testimonials as client carousel with arrows"`

---

### Task 8: Vérification globale et push

**Step 1:** `npm run test:run` → tout passe (187 + 2 existants + 3 nouveaux ≈ 192+).
**Step 2:** `npx tsc --noEmit` → 0 erreur. `npm run build` → succès.
**Step 3:** `npx eslint src/components/templates src/app/demo src/app/globals.css` → 0 erreur warning lié.
**Step 4:** `git push origin master`.

---

## Notes de conception

- **Studio/Urban doublent le contenu** (`[...t, ...t]`) pour le rebouclage `-50%` sans saut.
- **Édito** : `--i`/`--n` en variables CSS pilotent le delay ; `h-40` sur le stage stabilise la hauteur (textes courts).
- **Obsidienne** : module arithmétique pour la boucle modulo, flèches masquées à 1 élément, index affiché `1 / n`.
- `aria-hidden` sur les citations masquées Édito préserve l'accessibilité.