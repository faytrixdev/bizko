# P0 Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Livrer la roadmap P0 de `docs/2026-09-03-strategic-analysis.md` : annuaire public `/explore`, section témoignages sur les profils, et digest email hebdomadaire.

**Architecture:** 3 features indépendantes. `/explore` = page server component rendue par `searchParams` + RPC SQL `search_public_profiles` (SECURITY DEFINER). Témoignages = table `testimonials` (RLS, insertion visiteur en `pending`) + onglet dashboard + section profil public. Digest = cron Vercel → route `/api/cron/digest` → Resend, via RPC d'agrégats + libs pures testées (`suggestion`, `renderEmail`, `week`).

**Tech Stack:** Next.js 16.3.3 (App Router, `src/`), React 19, Supabase (RLS + RPC SECURITY DEFINER), Tailwind 4, i18n JSON custom, Vitest + Testing Library (jsdom), Resend.

**Doc de référence design :** `docs/plans/2026-09-05-p0-roadmap-design.md` (validé). Conventions repo : loi TDD fer (libs `src/lib/*` → test rouge d'abord), clés i18n fr/en ASCII sans accents, pas de commentaires superflus, migrations appliquées manuellement via Supabase SQL Editor, commits fréquents en anglais (style `feat(x): ...`), push direct sur `master`.

---

## Phase 0 — Convention d'exécution

### Task 0.1: Lire les docs Next 16 requises

**Files:**
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

**Step 1: Lire** les 4 fichiers (exigence `AGENTS.md`).
**Step 2: Vérifier** : `searchParams` est une `Promise` ; page avec `searchParams` = rendu dynamique ; route handlers `export async function GET(request: Request)`.
**Step 3: Lire les patterns existants** (scripts du repo après) : `package.json` (`test:run`, `lint`, `build`).
**Step 4: Commit** — aucun code, passer.

### Task 0.2: Base : install dépendance et env (digest)

**Files:**
- Modify: `.env.example`

**Step 1:** `npm install resend`
**Step 2:** Ajouter à `.env.example` :
```
RESEND_API_KEY=
RESEND_FROM=digest@bizko.pro
CRON_SECRET=
DIGEST_SECRET=
```
**Step 3:** `npm run build` intact (pas encore branché).
**Step 4: Commit** : `chore(deps): add resend and digest env vars`

---

## FEATURE 1 — /explore

### Task 1: Catégories — lib pure + i18n

**Files:**
- Create: `src/lib/categories.ts`
- Create: `src/lib/__tests__/categories.test.ts`
- Modify: `messages/fr.json` (ajouter namespace `categories`)
- Modify: `messages/en.json` (idem)

**Step 1: Écrire le test qui échoue**

```ts
// src/lib/__tests__/categories.test.ts
import { describe, it, expect } from "vitest";
import { CATEGORIES, isCategory } from "@/lib/categories";
import fr from "../../../messages/fr.json";
import en from "../../../messages/en.json";

describe("categories", () => {
  it("have unique slugs", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(3);
  });
  it("isCategory guards values", () => {
    expect(isCategory("photo")).toBe(true);
    expect(isCategory("inexistant")).toBe(false);
  });
  it("every slug is localized in fr and en", () => {
    for (const slug of CATEGORIES) {
      expect(fr.categories?.[slug]).toBeTruthy();
      expect(en.categories?.[slug]).toBeTruthy();
    }
  });
});
```

**Step 2: Run** `npm run test:run -- categories` — Expected: FAIL (module inexistant).

**Step 3: Implémenter**

```ts
// src/lib/categories.ts
export const CATEGORIES = [
  "photo",
  "design",
  "video",
  "makeup",
  "dev",
  "community",
  "consult",
  "coach",
  "music",
  "autre",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
```

Ajouter aux deux fichiers messages (structure JSON identique) :
```json
"categories": {
  "photo": "Photographe",
  "design": "Designer",
  "video": "Vid\u00e9aste",
  "makeup": "Maquilleur",
  "dev": "D\u00e9veloppeur",
  "community": "Community manager",
  "consult": "Consultant",
  "coach": "Coach / Formateur",
  "music": "Musicien",
  "autre": "Autre"
}
```
(en.json : équivalents anglais — attention clés ASCII, valeurs accentuables.)

**Step 4: Run** `npm run test:run -- categories` — Expected: PASS.
**Step 5: Commit** : `feat(explore): add curated categories list + i18n`

### Task 2: Réserver le slug `explore`

**Files:**
- Modify: `src/lib/reservedUsernames.ts`
- Modify: `src/lib/supabase/middleware.ts:43-57`
- Modify: `src/lib/__tests__/reservedUsernames.test.ts` (créer si absent)

**Step 1: Vérifier le contenu** de `reservedUsernames.ts` et son éventuel test existant.
**Step 2: Écrire le test** (créer le fichier s'il n'existe pas) :
```ts
import { describe, it, expect } from "vitest";
import { RESERVED_USERNAMES } from "@/lib/reservedUsernames";

describe("RESERVED_USERNAMES", () => {
  it("blocks the explore slug", () => {
    expect(RESERVED_USERNAMES).toContain("explore");
  });
});
```
**Step 3: Run** — FAIL.
**Step 4: Implémenter** : ajouter `"explore"` à `RESERVED_USERNAMES`. Puis ajouter `"explore"` à `reservedRootPrefixes` (Tableau) dans `src/lib/supabase/middleware.ts`, là où `dashboard`, `account`, `admin`, `pricing`, `login`, etc. sont listés.
**Step 5: Run** — PASS. **Commit** : `feat(explore): reserve explore root prefix`

### Task 3: Migration SQL — RPC `search_public_profiles`

**Files:**
- Create: `supabase/migrations/20250905000003_explore_search_rpc.sql`

**Step 1: S'assurer** que le fichier précédent de scénario (`20250904...`) existe en base ; numéroter après.

**Step 2: Écrire la migration** (complet) :
```sql
-- search_public_profiles : annuaire public, profils is_public uniquement
create or replace function public.search_public_profiles(
  p_query text default null,
  p_city text default null,
  p_category text default null,
  p_limit int default 24,
  p_offset int default 0
)
returns table (
  id uuid,
  username text,
  display_name text,
  tagline text,
  avatar_url text,
  city text,
  country text,
  category text,
  template text,
  is_pro boolean,
  total bigint
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    p.id,
    p.username,
    p.display_name,
    p.tagline,
    p.avatar_url,
    p.city,
    p.country,
    p.category,
    p.template,
    case
      when s.plan = 'pro' and s.status in ('active', 'trialing') then true
      else false
    end as is_pro,
    count(*) over ()::bigint as total
  from public.profiles p
  left join public.subscriptions s on s.profile_id = p.id
  where p.is_public = true
    and (
      p_query is null or p_query = ''
      or p.username ilike '%' || p_query || '%'
      or p.display_name ilike '%' || p_query || '%'
      or p.city ilike '%' || p_query || '%'
      or p.category ilike '%' || p_query || '%'
      or p.bio ilike '%' || p_query || '%'
    )
    and (p_city is null or p_city = '' or p.city = p_city)
    and (p_category is null or p_category = '' or p.category = p_category)
  order by is_pro desc, p.display_name asc
  limit greatest(least(p_limit, 48), 1)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.search_public_profiles(text, text, text, int, int) from public;
grant execute on function public.search_public_profiles(text, text, text, int, int) to anon, authenticated;
```

**Step 3: Vérifier en base** (Supabase SQL Editor) : `select username, is_pro, total from public.search_public_profiles(p_query => 'a');` → lignes publiques. Tester `p_category` inconnu → 0 ligne. Vérifier qu'aucun profil `is_public=false` n'apparaît.
**Step 4: Commit** : `feat(explore): add search_public_profiles RPC`

### Task 4: Helper query + page server `/explore`

**Files:**
- Modify: `src/lib/supabase/queries.ts`
- Create: `src/app/explore/page.tsx`
- Modify: `messages/fr.json` + `messages/en.json` (namespace `explore`)

**Step 1: Lire** `src/lib/supabase/queries.ts` (pattern `createPublicClient`) et `src/app/[username]/page.tsx` (pattern `getServerMessages` + `generateMetadata`).

**Step 2: Ajouter au namespace messages** (ici fr ; copier en en) :
```json
"explore": {
  "title": "Explorer les talents",
  "description": "Trouvez des freelances et prestataires en C\u00f4te d\u2019Ivoire",
  "searchPlaceholder": "Rechercher un nom, un m\u00e9tier, une ville\u2026",
  "filterCity": "Ville",
  "filterCategory": "Cat\u00e9gorie",
  "allCities": "Toutes les villes",
  "allCategories": "Toutes les cat\u00e9gories",
  "empty": "Aucun profil trouv\u00e9",
  "emptyHint": "Essayez d\u2019autres filtres",
  "reset": "R\u00e9initialiser",
  "previous": "Pr\u00e9c\u00e9dent",
  "next": "Suivant",
  "page": "Page {current} sur {total}",
  "pro": "Pro"
}
```
(Attention : clés ASCII, valeurs accentuables ; `{current}`/`{total}` : vérifier comment le t() du repo gère les vars — `getNested` renvoie le string tel quel, donc le page component interpolera manuellement après `t()`.)

**Step 3: Ajouter le helper dans `queries.ts`** :
```ts
export type ExploreFilters = { q?: string; city?: string; category?: string; page?: number };
export type ExploreResult = {
  id: string; username: string; displayName: string; tagline: string;
  avatarUrl: string | null; city: string; country: string;
  category: string | null; template: string; isPro: boolean;
};
export type ExplorePage = { items: ExploreResult[]; total: number };
```
Lire comment les lignes supabase sont typées/cartées (ex. `mapProfile`) et suivre le même mapping. Fonction :
```ts
export async function searchExplore(filters: ExploreFilters): Promise<ExplorePage> {
  const limit = 24;
  const { data, error } = await createPublicClient()
    .rpc("search_public_profiles", {
      p_query: filters.q || null,
      p_city: filters.city || null,
      p_category: filters.category || null,
      p_limit: limit,
      p_offset: ((filters.page ?? 1) - 1) * limit,
    });
  if (error) throw error;
  const items = (data ?? []).map((r) => ({ ...mapping... }));
  return { items, total: data?.[0]?.total ?? 0 };
}
```
**Step 4: Écrire `src/app/explore/page.tsx`** (server component) :
```tsx
import type { Metadata } from "next";
import { getServerMessages } from "@/lib/i18n/messages-server";
import { searchExplore } from "@/lib/supabase/queries";
import { ExploreFilters } from "@/components/explore/ExploreFilters";
import { ExploreCard } from "@/components/explore/ExploreCard";

type Props = { searchParams: Promise<{ q?: string; ville?: string; cat?: string; page?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const msg = await getServerMessages();
  return { title: msg.explore.title, description: msg.explore.description };
}

export default async function ExplorePage({ searchParams }: Props) {
  const raw = await searchParams;
  const msg = await getServerMessages();
  const page = Math.max(1, Number(raw.page) || 1);
  const filters = { q: raw.q?.trim() || undefined, city: raw.ville?.trim() || undefined, category: raw.cat?.trim() || undefined, page };
  const result = await searchExplore(filters);
  // render: <ExploreFilters values={filters}/>, grid de <ExploreCard item={item}/>,
  // état vide si items.length === 0, pagination (page courante, totalPages).
}
```
Le `ExploreFilters` émet un formulaire `GET` vers `/explore` avec des inputs `name="q"`, `name="ville"`, `name="cat"`. La pagination pareil (liens avec mêmes params + `page`). Aucun composant n'a besoin de state pour ça.

**Step 5:** `npm run build` passe (page compilable). **Commit** : `feat(explore): add explore page`

### Task 5: Composants ExploreCard + ExploreFilters + test

**Files:**
- Create: `src/components/explore/ExploreCard.tsx`
- Create: `src/components/explore/ExploreFilters.tsx`
- Create: `src/components/explore/__tests__/ExploreCard.test.tsx`

**Step 1: Test qui échoue**
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExploreCard } from "../ExploreCard";
import type { ExploreResult } from "@/lib/supabase/queries";

vi.mock("@/lib/i18n/provider", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  Provider: ({ children }: { children: React.ReactNode }) => children,
}));

const makeItem = (over: Partial<ExploreResult> = {}): ExploreResult => ({
  id: "id", username: "jdupont", displayName: "Jean Dupont", tagline: "Photographe wedding",
  avatarUrl: null, city: "Abidjan", country: "CI", category: "photo", template: "portfolio",
  isPro: false, ...over,
});

describe("ExploreCard", () => {
  it("renders name, city and pro badge when pro", () => {
    const { container } = render(<ExploreCard item={makeItem({ isPro: true })} />);
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(container.querySelector('a[href="/jdupont"]')).not.toBeNull();
  });
  it("omits pro badge and category chip when absent", () => {
    render(<ExploreCard item={makeItem({ isPro: false, category: null })} />);
    expect(screen.queryByText("Pro")).toBeNull();
  });
});
```
Le test appelle `t()` — imiter `useI18n` avec un mock vi.mock du provider (le repo teste déjà des composants clients, ex. `ViewTracker.test.tsx` — suivre le même motif de mock). Si `ExploreCard` est un server-safe composant (pas de client), injecter les strings en props depuis le page au lieu de `useI18n` — **dans ce cas adapter le test en conséquence** (préférer : strings passées en props, `language` aussi, garder le composant sans hooks → test trivial).

**Step 2: Run** — FAIL.
**Step 3: Implémenter** `ExploreCard` comme composant sans hooks recevant `item` + strings i18n en props (le page lui passe `msg.explore.pro`, le nom de catégorie localisé). `ExploreFilters` client avec `useI18n().t` pour les labels, rendant `form method="get" action="/explore"` + inputs `q`, `ville`, `cat` + sélects des villes (props `cities: string[]`) et catégories (props `categories: {value,label}[]`).
**Step 4: Run** — PASS. **Commit** : `feat(explore): add explore card + filters components`

### Task 6: Navbar landing + sitemap

**Files:**
- Modify: `src/components/landing/LandingNavbar.tsx`
- Modify: `src/app/sitemap.ts`
- Modify: `messages/fr.json` + `messages/en.json`

**Step 1: Lire** `LandingNavbar.tsx` (items du menu lignes ~21-27) et `src/app/sitemap.ts`.
**Step 2:** Ajouter un item menu `/explore` (clé `landing.explore` ou réutiliser `explore.title` — choix selon la structure `msg.landing` du composant) ; ajouter l'URL `/explore` au sitemap (statique, avec le changement-frequency approprié).
**Step 3: vérif build.** **Commit** : `feat(explore): link explore in navbar and sitemap`

---

## FEATURE 2 — Témoignages

### Task 7: Migration SQL — table `testimonials` + RLS

**Files:**
- Create: `supabase/migrations/20250905000004_testimonials.sql`

**Step 1: Écrire la migration** :
```sql
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_role text check (author_role is null or char_length(author_role) between 1 and 120),
  content text not null check (char_length(content) between 1 and 400),
  rating smallint check (rating between 1 and 5),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_testimonials_profile on public.testimonials(profile_id, is_published);

alter table public.testimonials enable row level security;

create policy "public read published" on public.testimonials
  for select using (is_published = true);

create policy "owner all" on public.testimonials
  for all using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "visitor insert pending" on public.testimonials
  for insert to anon, authenticated
  with check (auth.uid() is distinct from profile_id and is_published = false);
```
**Step 2: Vérifier en base** : insertion anon avec `is_published=true` → REJET ; avec `false` → OK ; lecture publique ne montre que les publiés ; owner CRUD OK.
**Step 3: Commit** : `feat(testimonials): add testimonials table and RLS`

### Task 8: Lib pure `testimonials.ts` + validation (TDD)

**Files:**
- Create: `src/lib/testimonials.ts`
- Create: `src/lib/__tests__/testimonials.test.ts`

**Step 1: Test qui échoue**
```ts
import { describe, it, expect } from "vitest";
import { isValidTestimonialInput, MAX_TESTIMONIAL_CONTENT } from "@/lib/testimonials";

describe("isValidTestimonialInput", () => {
  it("accepts a valid input", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "Superbe prestation!" })).toBe(true);
  });
  it("rejects empty author or content", () => {
    expect(isValidTestimonialInput({ authorName: "", content: "ok" })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: " " })).toBe(false);
  });
  it("rejects content above limit", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "x".repeat(MAX_TESTIMONIAL_CONTENT + 1) })).toBe(false);
  });
  it("rejects rating out of 1..5", () => {
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 6 })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 0 })).toBe(false);
    expect(isValidTestimonialInput({ authorName: "Awa", content: "ok", rating: 5 })).toBe(true);
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter**
```ts
export const MAX_TESTIMONIAL_CONTENT = 400;
export const MAX_TESTIMONIAL_NAME = 120;
export const MAX_TESTIMONIAL_ROLE = 120;

export type TestimonialInput = {
  authorName: string;
  authorRole?: string;
  content: string;
  rating?: number;
};

export function isRating(value: number): value is 1 | 2 | 3 | 4 | 5 {
  return value >= 1 && value <= 5;
}

export function isValidTestimonialInput(input: TestimonialInput): boolean {
  const nameOk = input.authorName.trim().length >= 1 && input.authorName.trim().length <= MAX_TESTIMONIAL_NAME;
  const roleOk = input.authorRole === undefined || input.authorRole.trim() === ""
    || (input.authorRole.trim().length >= 1 && input.authorRole.trim().length <= MAX_TESTIMONIAL_ROLE);
  const contentOk = input.content.trim().length >= 1 && input.content.trim().length <= MAX_TESTIMONIAL_CONTENT;
  const ratingOk = input.rating === undefined || isRating(input.rating);
  return nameOk && roleOk && contentOk && ratingOk;
}
```
**Step 4: Run** — PASS. **Step 5: Commit** : `feat(testimonials): add input validation lib`

### Task 9: Limites plan — `maxPublishedTestimonials` (TDD)

**Files:**
- Modify: `src/lib/plans.ts`
- Modify: `src/lib/__tests__/plans.test.ts`
- Modify: `messages/fr.json` + `messages/en.json` (clé pricing)

**Step 1: Lire** `src/lib/plans.ts` (structure `LIMITS`, `getLimits`, `PLAN_COMPARISON`, `ComparisonRow`) et `plans.test.ts`.
**Step 2: Ajouter au test** :
```ts
it("free allows 2 published testimonials, pro unlimited", () => {
  expect(getLimits("free").maxPublishedTestimonials).toBe(2);
  expect(getLimits("pro").maxPublishedTestimonials).toBe(Infinity);
});
```
**Step 3: Run** — FAIL. **Step 4: Implémenter** :
- Ajouter `maxPublishedTestimonials: 2` au bloc `free` et `maxPublishedTestimonials: Infinity` au bloc `pro` de `LIMITS` dans `src/lib/plans.ts`.
- Ajouter la ligne correspondante dans `PLAN_COMPARISON` (suivre le type `ComparisonRow` : `free: 2`, `pro:` sentinelle/∞, clé message `pricing.testimonials`).
- Ajouter `"testimonials": "...2..."` / `"...Illimité..."` aux messages pricing fr/en.
**Step 5: Run** — PASS. **Commit** : `feat(testimonials): add testimonial plan limits`

### Task 10: Server actions (add / approve / delete)

**Files:**
- Modify: `src/app/dashboard/actions.ts`

**Step 1: Lire** `actions.ts` entièrement (formes de retour `{ error }`, `updateTag(PUBLIC_PROFILES_TAG)` + `revalidatePath`, motif `canAddService` du quota, `currentLimits`, client serveur/middleware). Suivre exactement le même style.

**Step 2: Implémenter** trois actions :
- `addTestimonial(formData)` : owner, `is_published=true` par défaut, valider via `isValidTestimonialInput`, vérifier quota (count publiés + `is_pro` RPC, pattern existant) → si dépassé renvoyer `{ error: ... }` (message i18n servi par le client via clé msg).
- `approveTestimonial(id)` : owner, `update({ is_published: true })`, + même contrôle de quota.
- `deleteTestimonial(id)` : owner, `delete()`.
- Chacune : après succès `updateTag(PUBLIC_PROFILES_TAG)` + `revalidatePath` du dashboard et du profil public.
- Le client affiche l'erreur retournée (pattern des autres tabs).

**Step 3: `npm run build`** passe. **Step 4: Commit** : `feat(testimonials): add testimonial server actions`

### Task 11: Onglet dashboard `temoignages`

**Files:**
- Create: `src/components/dashboard/TabTestimonials.tsx`
- Modify: `src/app/dashboard/DashboardClient.tsx` (ajouter `temoignages` à `TABS`)
- Modify: `src/app/dashboard/page.tsx` (charger `testimonials` du user dans le `Promise.all`)
- Modify: `messages/fr.json` + `en.json` (namespace `dashboard.testimonials` + clé `dashboard.tabs.temoignages`)

**Step 1: Lire** `TabServices.tsx` (format des formulaires/erreurs/CTA) et `TabPortfolio.tsx` (gestion quota free/pro) pour reproduire le style.
**Step 2: Implémenter** `TabTestimonials.tsx` (client) :
- Liste : publiés puis pending (badge « en attente »), boutons Approuver (si pending) / Supprimer (form actions serveur).
- Formulaire owner : nom, rôle, texte, note 1-5 (sélecteur étoiles simple) → `addTestimonial`.
- Bannière de quota si free et publiés >= 2 (réutiliser la bannière Pro du dashboard ou un bloc dédié).
- Brancher dans `DashboardClient` (tab + label i18n).
**Step 3:** Message si liste vide : « Aucun témoignage » + hint.
**Step 4: `npm run build`** + éventuel test si logique extraite. **Commit** : `feat(testimonials): add dashboard tab`

### Task 12: Section profil public + `TestimonialCard` + test

**Files:**
- Modify: `src/lib/supabase/queries.ts` (`fetchPublicProfileData` : charger `testimonials` publiés triés desc)
- Modify: `src/app/[username]/page.tsx` (section Témoignages, jointe au cache existant)
- Create: `src/components/TestimonialCard.tsx`
- Create: `src/components/__tests__/TestimonialCard.test.tsx`
- Modify: `messages/fr.json` + `en.json` (namespace `profile.testimonials`)

**Step 1: Test `TestimonialCard`** (strings passées en props, pas de hooks) :
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestimonialCard } from "../TestimonialCard";

const testimonial = {
  id: "t1", authorName: "Awa", authorRole: "CEO, Studio D", content: "Une prestation exceptionnelle", rating: 5 as const,
};

describe("TestimonialCard", () => {
  it("renders author, role, content and 5 stars", () => {
    render(<TestimonialCard testimonial={testimonial} starLabel="stars" />);
    expect(screen.getByText("Awa")).toBeInTheDocument();
    expect(screen.getByText("CEO, Studio D")).toBeInTheDocument();
    expect(screen.getByText("Une prestation exceptionnelle")).toBeInTheDocument();
  });
  it("renders no stars when rating is absent", () => {
    const { container } = render(<TestimonialCard testimonial={{ ...testimonial, rating: undefined }} starLabel="stars" />);
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter** `TestimonialCard` sans hooks (props : testimonial + strings), rend l'initiale (1re lettre du nom dans un rond), nom, rôle, texte, 5 étoiles dorées selon `rating` (rendre `rating` SVGs pleins — utiliser `lucide-react` `Star`, déjà au repo).
**Step 4: Run** — PASS.
**Step 5:** Brancher dans `fetchPublicProfileData` :
```ts
const testimonials = await supabase.from("testimonials")
  .select("id, author_name, author_role, content, rating")
  .eq("is_published", true)
  .order("created_at", { ascending: false });
```
(map vers `{ id, authorName, authorRole, content, rating }`), puis section dans `page.tsx` (cachée si vide) avec les messages `profile.testimonials` (titre + sous-titre).
**Step 6: Commit** : `feat(testimonials): show testimonials on public profile`

---

## FEATURE 3 — Digest hebdo

### Task 13: Migration SQL — tables digest + RPC agrégats + revork grants

**Files:**
- Create: `supabase/migrations/20250905000005_digest.sql`

**Step 1: Migration** (complet) :
```sql
create table if not exists public.digest_prefs (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  unsubscribed_at timestamptz not null default now()
);

create table if not exists public.digest_sends (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week text not null,
  sent_at timestamptz not null default now(),
  email text not null,
  primary key (profile_id, week)
);

alter table public.digest_prefs enable row level security;
alter table public.digest_sends enable row level security;

create policy "owner read own prefs" on public.digest_prefs
  for select using (auth.uid() = profile_id);
create policy "owner read own sends" on public.digest_sends
  for select using (auth.uid() = profile_id);

create or replace function public.get_profile_weekly_digest(p_profile_id uuid)
returns jsonb
language sql
security definer
set search_path = pg_catalog, public
as $$
  with cur as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '7 days'
  ),
  prev as (
    select
      count(*) filter (where type = 'view') as views,
      count(*) filter (where type like 'click%') as clicks
    from public.events
    where profile_id = p_profile_id
      and created_at >= now() - interval '14 days'
      and created_at < now() - interval '7 days'
  ),
  top as (
    select s.title as service_name, count(e.id) as seen
    from public.events e
    join public.services s on s.id = e.service_id
    where e.profile_id = p_profile_id
      and e.type = 'view'
      and e.service_id is not null
      and e.created_at >= now() - interval '7 days'
    group by s.title
    order by seen desc
    limit 1
  )
  select jsonb_build_object(
    'views', (select views from cur),
    'clicks', (select clicks from cur),
    'prev_views', (select views from prev),
    'prev_clicks', (select clicks from prev),
    'top_service_name', (select service_name from top),
    'top_service_count', coalesce((select seen from top), 0),
    'has_activity', ((select views from cur) + (select clicks from cur) > 0)
  );
$$;

revoke all on function public.get_profile_weekly_digest(uuid) from public;
grant execute on function public.get_profile_weekly_digest(uuid) to authenticated;
```
**Step 2: Vérifier en base** : sur le profil sandbox avec des events, `select public.get_profile_weekly_digest('<uuid>')` → jsonb avec compteurs cohérents ; `has_activity=false` sur un profil sans events.
**Step 3: Commit** : `feat(digest): add digest tables and weekly stats RPC`

### Task 14: Lib `week.ts` (TDD)

**Files:**
- Create: `src/lib/digest/week.ts`
- Create: `src/lib/__tests__/digest-week.test.ts`

**Step 1: Test**
```ts
import { describe, it, expect } from "vitest";
import { isoWeek, currentWeekKey } from "@/lib/digest/week";

describe("digest week", () => {
  it("formats ISO week key", () => {
    const d = new Date("2026-09-07T10:00:00Z"); // lundi
    expect(isoWeek(d)).toBe("2026-W37");
  });
  it("currentWeekKey returns 2026-Wxx format", () => {
    expect(currentWeekKey()).toMatch(/^\d{4}-W\d{2}$/);
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter** (sans dep) :
```ts
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = d.getTime();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + 3);
  const year = d.getUTCFullYear();
  const week = Math.floor((firstThursday - Date.UTC(year, 0, 4)) / (7 * 24 * 3600 * 1000)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}
export function currentWeekKey(now: Date = new Date()): string {
  return isoWeek(now);
}
```
**Step 4: Run** — PASS. **Step 5: Commit** : `feat(digest): add iso week helper`

### Task 15: Lib `suggestion.ts` (TDD)

**Files:**
- Create: `src/lib/digest/suggestion.ts`
- Create: `src/lib/__tests__/digest-suggestion.test.ts`

**Step 1: Test**
```ts
import { describe, it, expect } from "vitest";
import { selectSuggestion, SUGGESTION_TYPES } from "@/lib/digest/suggestion";

const base = { hasBio: true, serviceCount: 3, hasPortfolio: true, isPro: false };

describe("selectSuggestion", () => {
  it("returns bio when bio is empty", () => {
    expect(selectSuggestion({ ...base, hasBio: false })).toBe("bio");
  });
  it("returns services when fewer than 3", () => {
    expect(selectSuggestion({ ...base, serviceCount: 2, hasPortfolio: true })).toBe("services");
  });
  it("returns portfolio when none", () => {
    expect(selectSuggestion({ ...base, hasPortfolio: false })).toBe("portfolio");
  });
  it("returns pro cta when everything is fine and free", () => {
    expect(selectSuggestion(base)).toBe("pro_cta");
  });
  it("returns null when everything fine and already pro", () => {
    expect(selectSuggestion({ ...base, isPro: true })).toBeNull();
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter**
```ts
export const SUGGESTION_TYPES = ["bio", "services", "portfolio", "pro_cta"] as const;
export type SuggestionType = (typeof SUGGESTION_TYPES)[number];

export type SuggestionInput = {
  hasBio: boolean;
  serviceCount: number;
  hasPortfolio: boolean;
  isPro: boolean;
};

export function selectSuggestion(input: SuggestionInput): SuggestionType | null {
  if (!input.hasBio) return "bio";
  if (input.serviceCount < 3) return "services";
  if (!input.hasPortfolio) return "portfolio";
  if (!input.isPro) return "pro_cta";
  return null;
}
```
**Step 4: Run** — PASS. **Step 5: Commit** : `feat(digest): add suggestion selector`

### Task 16: Lib `renderEmail.ts` (TDD)

**Files:**
- Create: `src/lib/digest/renderEmail.ts`
- Create: `src/lib/__tests__/digest-email.test.ts`
- Modify: `messages/fr.json` + `en.json` (namespace `digest`)

**Step 1: Test** (rendu HTML avec `/ \` échappés — ce repo n'échappe pas forcément le HTML d'email ; garder simple : template string, tester contenu présent) :
```ts
import { describe, it, expect } from "vitest";
import { buildDigestEmail } from "@/lib/digest/renderEmail";
import { getMessages } from "@/lib/i18n/messages";

const input = {
  displayName: "Jean",
  views: 10, clicks: 3, prevViews: 4, prevClicks: 1,
  topServiceName: "Photographie mariage",
  suggestion: { type: "pro_cta" as const, label: "Passez Pro", url: "https://bizko.pro/pricing" },
  unsubUrl: "https://bizko.pro/api/digest/unsubscribe?profile=abc&sig=xyz",
  isPro: false,
};

describe("buildDigestEmail", () => {
  it("includes stats, suggestion, cta and unsubscribe link for a free user", () => {
    const msg = getMessages("fr");
    const { subject, html } = buildDigestEmail({ ...input, messages: msg });
    expect(html).toContain("10");
    expect(html).toContain("Passez Pro");
    expect(html).toContain("unsubscribe?profile=abc&sig=xyz");
    expect(subject.length).toBeGreaterThan(0);
  });
  it("omits the cta for a pro user", () => {
    const msg = getMessages("fr");
    const { html } = buildDigestEmail({ ...input, isPro: true, messages: msg });
    expect(html).not.toContain("Passez Pro");
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter** `buildDigestEmail({ displayName, views, clicks, prevViews, prevClicks, topServiceName, suggestion, unsubUrl, isPro, messages }) → { subject, html }` en pur template string. La clé `digest.subject` du message est le sujet (optionnellement préfixée par le prénom). L'affiche du CTA seulement si `!isPro`. Les clés `digest` (fr) :
```json
"digest": {
  "subject": "Vos stats de la semaine sur Bizko",
  "hello": "Bonjour {name},",
  "viewsLabel": "Vues",
  "clicksLabel": "Clics WhatsApp",
  "topService": "Votre service le plus visit\u00e9",
  "variationUp": "+{value}%",
  "variationDown": "{value}%",
  "suggestionTitle": "L\u2019id\u00e9e de la semaine",
  "proCtaLabel": "Passez Pro",
  "proCtaUrl": "https://bizko.pro/pricing",
  "footerUnsub": "Vous recevez ce r\u00e9sum\u00e9 car votre profil Bizko a de l\u2019activit\u00e9.",
  "footerUnsubLink": "Se d\u00e9sinscrire",
  "footerBrand": "Envoy\u00e9 avec Bizko"
}
```
(en.json : équivalents.) Les 3 suggestions (`bio`, `services`, `portfolio`) ont des clés `digest.suggestionBio`, `digest.suggestionServices`, `digest.suggestionPortfolio`.
**Step 4: Run** — PASS. **Step 5: Commit** : `feat(digest): add email renderer`

### Task 17: Signature unsub + route de désinscription (TDD sur la lib de signature)

**Files:**
- Create: `src/lib/digest/signature.ts`
- Create: `src/lib/__tests__/digest-signature.test.ts`
- Create: `src/app/api/digest/unsubscribe/route.ts`
- Create: `src/app/digest/unsubscribed/page.tsx`

**Step 1: Test**
```ts
import { describe, it, expect } from "vitest";
import { signUnsubToken, verifyUnsubToken } from "@/lib/digest/signature";

describe("unsub token", () => {
  it("round-trips a valid token", () => {
    const token = signUnsubToken("profile-id", "secret");
    expect(verifyUnsubToken("profile-id", token, "secret")).toBe(true);
  });
  it("rejects tampered token", () => {
    const token = signUnsubToken("profile-id", "secret");
    expect(verifyUnsubToken("profile-id", token + "x", "secret")).toBe(false);
    expect(verifyUnsubToken("other-id", token, "secret")).toBe(false);
  });
  it("rejects wrong secret", () => {
    const token = signUnsubToken("profile-id", "secret");
    expect(verifyUnsubToken("profile-id", token, "other")).toBe(false);
  });
});
```
**Step 2: Run** — FAIL. **Step 3: Implémenter** (Node crypto, pas d'hébergement dans navigateur — route + cron sont Node) :
```ts
import { createHmac, timingSafeEqual } from "node:crypto";

export function signUnsubToken(profileId: string, secret: string): string {
  return createHmac("sha256", secret).update(profileId).digest("hex");
}

export function verifyUnsubToken(profileId: string, token: string, secret: string): boolean {
  const expected = signUnsubToken(profileId, secret);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
```
**Step 4: Run** — PASS.
**Step 5: Écrire `src/app/api/digest/unsubscribe/route.ts`** (GET) : lire `?profile=&sig=`, vérifier `process.env.DIGEST_SECRET`, `verifyUnsubToken` → 401 si mauvais ; admin client `upsert("digest_prefs", { profile_id, unsubscribed_at })` (ignoreDuplicates) ou `insert` ; return `NextResponse.redirect(new URL("/digest/unsubscribed", request.url))`. (Lire la doc route-handlers pour le format de réponse Next 16 ; le repo a `src/app/auth/callback/route.ts` comme exemple de redirect.)
**Step 6: Écrire `src/app/digest/unsubscribed/page.tsx`** (server, simple) avec message `digest.unsubscribedTitle`/`digest.unsubscribedBody` (ajouter aux messages).
**Step 7: Commit** : `feat(digest): add signed unsubscribe link + page`

### Task 18: Cron route `/api/cron/digest` + vercel.json

**Files:**
- Create: `src/app/api/cron/digest/route.ts`
- Create: `vercel.json`
- Modify: `.env.example` (si CRON_SECRET non documenté)

**Step 1: Lire** `src/app/api/webhooks/whop/route.ts` (style du handler, `createAdminClient`, headers) et la doc route-handlers.
**Step 2: Implémenter** `route.ts` (GET) :
```ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentWeekKey } from "@/lib/digest/week";
import { selectSuggestion } from "@/lib/digest/suggestion";
import { buildDigestEmail } from "@/lib/digest/renderEmail";
import { signUnsubToken } from "@/lib/digest/signature";
import { getMessages } from "@/lib/i18n/messages";

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "missing RESEND_API_KEY" }, { status: 500 });
  }
  const week = currentWeekKey();
  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, bio, locale, is_public")
    .eq("is_public", true);
  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }
  // map email: auth.admin.listUsers(page) — paginer sur le nombre de profils.
  // skip si digest_prefs.unsubscribed_at present OU digest_sends (profile_id, week) present.
  let sent = 0, skipped = 0;
  for (const profile of profiles) {
    const { data: digest } = await supabase.rpc("get_profile_weekly_digest", { p_profile_id: profile.id });
    if (!digest?.has_activity) { skipped++; continue; }
    const suggestions = selectSuggestion({
      hasBio: (profile.bio ?? "").trim().length > 0,
      serviceCount: /* count services (select count) */ 0,
      hasPortfolio: /* count portfolio_items */ false,
      isPro: /* is_pro(profile.id) via rpc */ false,
    });
    const messages = getMessages(profile.locale === "en" ? "en" : "fr");
    const unsubUrl = `${siteUrl}/api/digest/unsubscribe?profile=${profile.id}&sig=${signUnsubToken(profile.id, process.env.DIGEST_SECRET ?? "")}`;
    const { subject, html } = buildDigestEmail({ ... });
    await resend.emails.send({ from: process.env.RESEND_FROM ?? "digest@bizko.pro", to: email, subject, html });
    await supabase.from("digest_sends").insert({ profile_id: profile.id, week, email });
    sent++;
  }
  return NextResponse.json({ sent, skipped });
}
```
Notes : calcul du `serviceCount`/`hasPortfolio` côté admin en une requête groupée (`select profile_id, count(*)` avec `in` sur les ids) plutôt que du N+1 ; `is_pro` via `supabase.rpc("is_pro", { p_profile_id: profile.id })` ; `siteUrl` = `process.env.NEXT_PUBLIC_SITE_URL!`. Détail important : **les libs (suggestion/render) prennent déjà ce qu'il faut — l'ordre des tâches permet de concentrer toute la logique dans le route**. Garder le route TRÈS fin : la logique complexe est déjà dans les libs testées.
**Step 3: Créer `vercel.json`** :
```json
{ "crons": [{ "path": "/api/cron/digest", "schedule": "0 7 * * 1" }] }
```
**Step 4: `npm run build`** passe. **Step 5: Commit** : `feat(digest): add weekly digest cron`

---

## Vérifications finales

**Task 19: Verify**
- `npm run test:run` → tous verts (y compris les nouveaux : categories, reservedUsernames, testimonials, plans, digest-*).
- `npm run lint` → 0 erreur.
- `npm run build` → OK prod.
**Commit** : `chore: verify full suite` si des corrections, sinon rien.

**Task 20: Push**
`git push origin master` (les commits déjà faits en cours de route). Vérifier `git status` propre avant.

## Notes d'application (manuelles, hors code)
1. Appliquer les 3 migrations (`20250905000003`, `...04`, `...05`) via le SQL Editor Supabase, tester les smoke tests des RPC/listes RLS.
2. Configurer Vercel : `RESEND_API_KEY`, `RESEND_FROM`, `CRON_SECRET`, `DIGEST_SECRET` pour Production (Vercel CLI ou UI). Vérifier `vercel.json` déployé → cron actif.
3. Vérifier le domaine d'expéditeur (`digest@bizko.pro`) dans Resend (nécessite la validation du domaine) pour éviter le spool.
4. Créer un compte de test pour générer du trafic → valider un digest réel le lundi suivant.