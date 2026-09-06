# Système de 6 Templates — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the public profile template system from a 2-mode monolith (`[username]/page.tsx`) into a registry-driven set of 6 distinct templates (2 free + 4 pro) with a visual picker in the dashboard and plan gating.

**Architecture:**
- `src/lib/template-config.ts` holds pure data (ids, tiers, i18n keys) — no React imports, safe for server actions.
- `src/components/templates/*.tsx` — one server component per template, receiving a typed `TemplateProps` bundle. Templates render ONLY their sections (header, services, portfolio, socials, testimonials); the shared overlay (sticky/floating WhatsApp CTA, footer, trackers, testimonial form, page background) is injected by a new `ProfileView` renderer.
- `[username]/page.tsx` becomes a thin dispatcher (fetch data → `ProfileView`). The dashboard `<select>` is replaced by a `TemplatePicker` (6 cards, pro lock, upgrade CTA). Server action `updateProfile` gates the chosen template by plan.

**Tech Stack:** Next.js 16 (App Router, RSC), Tailwind 4, Supabase (migration + RLS), React 19, Vitest + Testing Library (jsdom).

Design doc (approved): `docs/plans/2026-09-06-templates-design.md`

---

## Prerequisites / conventions for every task
- Run commands from repo root `C:\Users\PC\Documents\Bizko`.
- Test runner: `npx vitest run <file>` (or `npm run test:run`). Lint: `npm run lint`. Build: `npm run build`.
- Server pages (route handlers, server actions, RSC pages) are NOT unit-tested (repo convention). Template components ARE (pure presentational).
- **Next.js breaking changes:** before using `next/font` or any new API, read `node_modules/next/dist/docs/` from the repo root and heed deprecation notices (AGENTS.md). If `next/font/google` API changed, adapt the font task accordingly.
- Commit after each green task. Never commit the `AGENTS.md` auto-block.
- Recommended: run this plan in a git worktree to keep `master` untouched during the refactor (see `using-git-worktrees`). If no worktree, commit on the current branch.

---

## Task 1: Mock `next/image` in test setup

**Files:**
- Modify: `test/setup.ts`

**Step 1: Modify the setup file**

`test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { src, alt = "", ...rest } = props as Record<string, unknown>;
    return <img src={src as string} alt={alt} {...rest} />;
  },
}));
```
Add at the top of the file (after the existing import): a `/* eslint-disable */`? No — add `// jsx-runtime` availability: add `<link rel="prefetch">`? Keep the mock minimal. If TS complains about JSX in a `.ts` file, rename nothing — instead cast: the file is `test/setup.ts`; JSX may error in `.ts`. Use `React.createElement` to avoid JSX:
```ts
import React from "react";
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return React.createElement("img", { src, alt: alt ?? "", ...rest });
  },
}));
```

**Step 2: Run the test suite to confirm no mock-related regression**

Run: `npm run test:run`
Expected: current tests still pass.

**Step 3: Commit**

```bash
git add test/setup.ts
git commit -m "test(setup): mock next/image for component tests"
```

---

## Task 2: DB migration — widen the template CHECK constraint

**Files:**
- Create: `supabase/migrations/20250906000000_templates.sql`

**Step 1: Create the migration**

`supabase/migrations/20250906000000_templates.sql`:
```sql
-- 6 public profiles templates (2 free + 4 pro).
-- The current constraint was created inline in 20250826000001_initial.sql with the
-- implicit name `profiles_template_check`.
alter table public.profiles
  drop constraint if exists profiles_template_check;

alter table public.profiles
  add constraint profiles_template_check check (
    template in ('minimal', 'portfolio', 'studio', 'edito', 'urban', 'obsidienne')
  );
```
**Verify the constraint name before running**: `select conname from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'c';` — if the name differs, use the real name in `drop constraint`.

**Step 2: Apply to local Supabase**

Run: `npx supabase db push` (local). For prod, apply via Supabase SQL editor. (Migrations are not unit-tested in this repo.)

**Step 3: Commit**

```bash
git add supabase/migrations/20250906000000_templates.sql
git commit -m "feat(db): allow 6 profile templates"
```

---

## Task 3: Widen the `Template` type

**Files:**
- Modify: `src/types/database.ts:55`

**Step 1: Edit the union**

`src/types/database.ts:55`:
```ts
export type Template = 'minimal' | 'portfolio' | 'studio' | 'edito' | 'urban' | 'obsidienne';
```

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

**Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "types(templates): widen Template union to 6 ids"
```

---

## Task 4: Template config module (pure data) — TDD

**Files:**
- Create: `src/lib/template-config.ts`
- Test: `src/lib/__tests__/template-config.test.ts`

**Step 1: Write the failing test**

`src/lib/__tests__/template-config.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  TEMPLATE_CONFIGS,
  getTemplateConfig,
  canUseTemplate,
  isTemplateId,
} from "../template-config";

describe("template-config", () => {
  it("exposes 6 templates", () => {
    expect(TEMPLATE_CONFIGS).toHaveLength(6);
  });

  it("has exactly 2 free and 4 pro templates", () => {
    expect(TEMPLATE_CONFIGS.filter((t) => t.tier === "free")).toHaveLength(2);
    expect(TEMPLATE_CONFIGS.filter((t) => t.tier === "pro")).toHaveLength(4);
  });

  it("has unique ids", () => {
    const ids = TEMPLATE_CONFIGS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps free templates first (picker order)", () => {
    const tiers = TEMPLATE_CONFIGS.map((t) => t.tier);
    const firstPro = tiers.indexOf("pro");
    expect(tiers.slice(0, firstPro).every((t) => t === "free")).toBe(true);
  });

  it("resolves a known id", () => {
    expect(getTemplateConfig("studio").id).toBe("studio");
  });

  it("falls back to minimal for unknown/null/undefined ids", () => {
    expect(getTemplateConfig("bogus").id).toBe("minimal");
    expect(getTemplateConfig(null).id).toBe("minimal");
    expect(getTemplateConfig(undefined).id).toBe("minimal");
  });

  it("gates templates by plan", () => {
    expect(canUseTemplate("free", "minimal")).toBe(true);
    expect(canUseTemplate("free", "portfolio")).toBe(true);
    expect(canUseTemplate("free", "studio")).toBe(false);
    expect(canUseTemplate("free", "obsidienne")).toBe(false);
    expect(canUseTemplate("pro", "studio")).toBe(true);
    expect(canUseTemplate("pro", "minimal")).toBe(true);
    expect(canUseTemplate("pro", "bogus")).toBe(false);
  });

  it("guards template ids", () => {
    expect(isTemplateId("studio")).toBe(true);
    expect(isTemplateId("bogus")).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/template-config.test.ts`
Expected: FAIL (module not found).

**Step 3: Write minimal implementation**

`src/lib/template-config.ts`:
```ts
import type { Plan } from "@/lib/plans";
import type { Template } from "@/types/database";

export interface TemplateConfig {
  id: Template;
  tier: "free" | "pro";
  /** i18n key for the display name, e.g. "dashboard.templateStudio" */
  nameKey: string;
  /** i18n key for the one-line picker description, e.g. "dashboard.templateDescStudio" */
  descriptionKey: string;
}

/** Picker order: 2 free first, then 4 pro. */
export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  { id: "minimal", tier: "free", nameKey: "dashboard.templateMinimal", descriptionKey: "dashboard.templateDescMinimal" },
  { id: "portfolio", tier: "free", nameKey: "dashboard.templatePortfolio", descriptionKey: "dashboard.templateDescPortfolio" },
  { id: "studio", tier: "pro", nameKey: "dashboard.templateStudio", descriptionKey: "dashboard.templateDescStudio" },
  { id: "edito", tier: "pro", nameKey: "dashboard.templateEdito", descriptionKey: "dashboard.templateDescEdito" },
  { id: "urban", tier: "pro", nameKey: "dashboard.templateUrban", descriptionKey: "dashboard.templateDescUrban" },
  { id: "obsidienne", tier: "pro", nameKey: "dashboard.templateObsidienne", descriptionKey: "dashboard.templateDescObsidienne" },
];

const TEMPLATE_BY_ID: Record<string, TemplateConfig> = Object.fromEntries(
  TEMPLATE_CONFIGS.map((cfg) => [cfg.id, cfg]),
);

/** Resolve a template by id; unknown/null/undefined falls back to the first (minimal). */
export function getTemplateConfig(id: string | null | undefined): TemplateConfig {
  return TEMPLATE_BY_ID[id ?? ""] ?? TEMPLATE_CONFIGS[0];
}

export function isTemplateId(value: string): value is Template {
  return value in TEMPLATE_BY_ID;
}

export function canUseTemplate(plan: Plan, id: string): boolean {
  const cfg = TEMPLATE_BY_ID[id];
  if (!cfg) return false;
  return plan === "pro" || cfg.tier === "free";
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/template-config.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/template-config.ts src/lib/__tests__/template-config.test.ts
git commit -m "feat(templates): template config module + plan gating"
```

---

## Task 5: Load the 3 new fonts for the public profile route

**Files:**
- Create: `src/app/[username]/layout.tsx`

**Step 1: Check the Next.js font API first (AGENTS.md)**

Read `node_modules/next/dist/docs/` for the `next/font` section. Confirm `next/font/google` + `variable` still the canonical approach in this Next version; adapt if deprecated.

**Step 2: Create the layout**

`src/app/[username]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import { Archivo_Narrow, EB_Garamond, Sora } from "next/font/google";

const archivo = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
  weight: ["400", "500", "600"],
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700"],
});

export default function UsernameLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${archivo.variable} ${garamond.variable} ${sora.variable}`}>
      {children}
    </div>
  );
}
```
The `@font-face` declarations are injected for all three, but the browser only downloads the faces actually referenced by the rendered template (declared-but-unused faces are not fetched).

**Step 3: Build to confirm fonts resolve**

Run: `npm run build`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/app/[username]/layout.tsx
git commit -m "feat(templates): inject archivo/garamond/sora fonts on public profiles"
```

---

## Task 6: Template props types + shared helpers

**Files:**
- Create: `src/components/templates/types.ts`
- Create: `src/components/templates/shared.tsx`

**Step 1: Write the types**

`src/components/templates/types.ts`:
```ts
import type { Messages } from "@/lib/i18n/messages";
import type { PublicTestimonial } from "@/lib/supabase/queries";
import type { Profile, Service, PortfolioItem, SocialLink } from "@/types/database";

export type ProfileMessages = Messages["profile"];

export interface TemplateLinks {
  /** Header WhatsApp href, wrapped in trackClick("click_main", …). */
  mainWa: string;
  /** tel: href, untracked. */
  telLink: string;
}

export interface TemplateProps {
  profile: Profile;
  services: Service[];
  portfolio: PortfolioItem[];
  socials: SocialLink[];
  testimonials: PublicTestimonial[];
  msg: ProfileMessages;
  locale: string;
  links: TemplateLinks;
  /** Builds a tracked href for a click type: `/api/track-click?pid=…&type=…&to=…` */
  trackClick: (type: string, to: string) => string;
}
```

**Step 2: Write shared helpers**

`src/components/templates/shared.tsx`:
```tsx
import Image from "next/image";
import type { Profile } from "@/types/database";

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

export function Avatar({ profile, className }: { profile: Profile; className?: string }) {
  if (profile.avatar_url) {
    return (
      <Image
        src={profile.avatar_url}
        alt={profile.display_name}
        width={96}
        height={96}
        className={`h-24 w-24 rounded-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`h-24 w-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-2xl ${className ?? ""}`}
    >
      {initials(profile.display_name)}
    </div>
  );
}

const dateFormatter = (locale: string) =>
  new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

export function formatTestimonialDate(locale: string, createdAt: string): string {
  return dateFormatter(locale).format(new Date(createdAt));
}
```

**Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/components/templates/types.ts src/components/templates/shared.tsx
git commit -m "feat(templates): shared TemplateProps types + avatar/date helpers"
```

---

## Task 7: Test fixture + MinimalTemplate + smoke test

**Files:**
- Create: `src/components/templates/__tests__/fixture.ts`
- Create: `src/components/templates/MinimalTemplate.tsx`
- Test: `src/components/templates/__tests__/MinimalTemplate.test.tsx`

**Step 1: Write the shared fixture**

`src/components/templates/__tests__/fixture.ts`:
```ts
import type { TemplateProps, ProfileMessages } from "../types";

const msg = {
  services: "Mes services",
  portfolio: "Mes réalisations",
  socials: "Me retrouver",
  whatsapp: "WhatsApp",
  call: "Appeler",
  demandBtn: "Demander",
  madeWith: "Fait avec",
  stickyWa: "Discuter sur WhatsApp",
  testimonials: { title: "Témoignages", subtitle: "Ce que mes clients disent", starsAria: "Note" },
} satisfies ProfileMessages;

export function makeTemplateProps(overrides: Partial<TemplateProps> = {}): TemplateProps {
  return {
    profile: {
      id: "p1",
      username: "awa_photo",
      display_name: "Awa Konaté",
      tagline: "Photographe à Abidjan",
      bio: "Je capture les moments qui comptent.",
      city: "Abidjan",
      country: "CI",
      phone_e164: "+2250700000000",
      email_public: null,
      template: "minimal",
      locale: "fr",
      avatar_url: null,
    },
    services: [
      { id: "s1", profile_id: "p1", title: "Séance studio", description: "1h en studio", price: 25000, currency: "XOF", position: 1 },
    ],
    portfolio: [
      { id: "pf1", profile_id: "p1", media_url: "https://example.com/a.jpg", media_type: "image", thumbnail_url: null, title: "Mariage", position: 1 },
    ],
    socials: [
      { id: "so1", profile_id: "p1", platform: "instagram", url: "https://instagram.com/awa", position: 1 },
    ],
    testimonials: [
      { id: "t1", authorName: "Mariam", authorRole: "Cliente", content: "Superbe travail", rating: 5, createdAt: "2026-08-01T00:00:00Z" },
    ],
    msg,
    locale: "fr",
    links: { mainWa: "https://wa.me/2250700000000?text=hi", telLink: "tel:+2250700000000" },
    trackClick: (type: string, to: string) => `/api/track-click?pid=p1&type=${type}&to=${encodeURIComponent(to)}`,
    ...overrides,
  };
}
```

**Step 2: Write the failing smoke test**

`src/components/templates/__tests__/MinimalTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MinimalTemplate } from "../MinimalTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("MinimalTemplate", () => {
  it("renders identity, contact, services, portfolio and socials", () => {
    render(<MinimalTemplate {...makeTemplateProps()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Awa Konaté");
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Mes services")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Mes réalisations")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
    expect(screen.getByText("Awa Konaté", { selector: "h1" })).toBeInTheDocument();
  });
});
```

**Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/MinimalTemplate.test.tsx`
Expected: FAIL (module not found).

**Step 4: Write the implementation — minimal branch port**

`src/components/templates/MinimalTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { PortfolioGallery } from "@/components/Lightbox";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const Pin = () => (
  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const Phone = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

export function MinimalTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar profile={profile} className="ring-4 ring-white shadow-lg" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight font-display leading-none text-gray-900">{profile.display_name}</h1>
        <p className="mt-2 text-base font-medium text-accent">{profile.tagline}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
          <Pin />
          <span className="text-xs font-medium text-gray-500">{profile.city} / {profile.country}</span>
        </div>
        {profile.bio && (
          <p className="mt-6 text-sm leading-7 text-gray-600 max-w-md bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm text-left">{profile.bio}</p>
        )}
        <div className="mt-6 w-full max-w-[400px] flex flex-col gap-3">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="h-12 w-full rounded-xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-whatsapp-hover transition-all duration-200 shadow-md shadow-[#25D366]/20">
            <SocialIcon platform="whatsapp" />
            {msg.whatsapp} - {profile.display_name.split(" ")[0]}
          </a>
          <a href={links.telLink} className="h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-700 transition-all duration-200">
            <Phone />
            {msg.call}
          </a>
        </div>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-xs tracking-widest uppercase text-gray-400 font-medium">{msg.services}</h2>
          <div className="grid gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                    {s.price != null && <p className="text-sm font-bold text-accent mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-whatsapp text-white text-xs font-semibold hover:bg-whatsapp-hover transition-all duration-200 shadow-sm shadow-[#25D366]/20">
                    <SocialIcon platform="whatsapp" className="w-3.5 h-3.5" />
                    {msg.demandBtn}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-xs tracking-widest uppercase text-gray-400 font-medium">{msg.portfolio}</h2>
          <PortfolioGallery items={portfolio} />
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-xs tracking-widest uppercase text-gray-400 font-medium">{msg.testimonials.title}</h2>
          <p className="px-1 mb-4 -mt-2 text-xs text-gray-500">{msg.testimonials.subtitle}</p>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-xs tracking-widest uppercase text-gray-400 font-medium">{msg.socials}</h2>
          <div className="grid gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                className="h-12 rounded-xl bg-gray-900 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <SocialIcon platform={s.platform} />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/MinimalTemplate.test.tsx`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/components/templates/__tests__/fixture.ts src/components/templates/MinimalTemplate.tsx src/components/templates/__tests__/MinimalTemplate.test.tsx
git commit -m "feat(templates): MinimalTemplate (free) + smoke test"
```

---

## Task 8: PortfolioTemplate + smoke test

**Files:**
- Create: `src/components/templates/PortfolioTemplate.tsx`
- Test: `src/components/templates/__tests__/PortfolioTemplate.test.tsx`

**Step 1: Write the failing test**

`src/components/templates/__tests__/PortfolioTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PortfolioTemplate } from "../PortfolioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("PortfolioTemplate", () => {
  it("renders the card header and key sections", () => {
    render(<PortfolioTemplate {...makeTemplateProps()} />);
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/PortfolioTemplate.test.tsx`
Expected: FAIL.

**Step 3: Implement — portfolio branch port**

`src/components/templates/PortfolioTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

export function PortfolioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <Avatar profile={profile} className="ring-4 ring-white shadow-lg" />
        <h1 className="text-3xl font-bold tracking-tight font-display mt-4 text-gray-900">{profile.display_name}</h1>
        <p className="text-base font-medium text-accent mt-2">{profile.tagline}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">{profile.city}, {profile.country}</span>
        </div>
        {profile.bio && <p className="text-sm text-gray-600 mt-4 leading-7 text-left bg-gray-50/50 border border-gray-100 rounded-2xl p-5 shadow-sm">{profile.bio}</p>}
        <div className="mt-5 flex gap-3">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-whatsapp-hover transition-all duration-200 shadow-md shadow-[#25D366]/20">
            <SocialIcon platform="whatsapp" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-xl border border-gray-200 bg-white inline-flex items-center justify-center hover:bg-gray-50 text-gray-500 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.services}</h2>
          <div className="rounded-2xl border border-gray-100 p-4 sm:p-5 grid gap-3 shadow-sm">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 flex gap-3 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                    {s.description && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{s.description}</p>}
                    {s.price != null && <p className="text-sm font-bold text-accent mt-2">{s.price.toLocaleString()} {s.currency}</p>}
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="self-center shrink-0 h-9 px-4 rounded-xl bg-accent text-white text-xs font-semibold inline-flex items-center justify-center hover:bg-accent-hover transition-all duration-200 shadow-sm shadow-[#FF6B35]/20">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.portfolio}</h2>
          <div className="grid grid-cols-3 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.testimonials.title}</h2>
          <p className="px-1 mb-4 -mt-2 text-xs text-gray-500">{msg.testimonials.subtitle}</p>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold font-display px-1 mb-4 text-gray-900">{msg.socials}</h2>
          <div className="grid gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                className="h-12 rounded-xl bg-gray-900 text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-200 shadow-sm">
                <SocialIcon platform={s.platform} />
                <span className="capitalize">{s.platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/PortfolioTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/PortfolioTemplate.tsx src/components/templates/__tests__/PortfolioTemplate.test.tsx
git commit -m "feat(templates): PortfolioTemplate (free) + smoke test"
```

---

## Task 9: StudioTemplate + smoke test

**Files:**
- Create: `src/components/templates/StudioTemplate.tsx`
- Test: `src/components/templates/__tests__/StudioTemplate.test.tsx`

**Step 1: Failing test**

`src/components/templates/__tests__/StudioTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StudioTemplate } from "../StudioTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("StudioTemplate", () => {
  it("renders the full-bleed hero and sections", () => {
    render(<StudioTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getAllByText("Mes réalisations").length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/StudioTemplate.test.tsx`
Expected: FAIL.

**Step 3: Implement**

Design: full-bleed dark hero on black, condensed Archivo name in huge uppercase, services as bordered cards, portfolio 2:3 grid, socials monochrome outline, testimonials dark cards.

`src/components/templates/StudioTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };

export function StudioTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Hero */}
      <header className="bg-[#0A0A0A] -mx-4 px-4 py-12 text-white">
        <div className="flex flex-col items-center text-center">
          <Avatar
            profile={profile}
            className="h-28 w-28 ring-2 ring-white/20 shadow-2xl"
          />
          <h1 style={CONDENSED} className="mt-6 text-5xl font-bold uppercase tracking-tight text-white text-center leading-[0.95]">
            {profile.display_name}
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-6 max-w-md text-sm leading-7 text-white/70">{profile.bio}</p>}
          <div className="mt-8 flex gap-3 w-full max-w-[400px]">
            <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-none bg-white text-black font-bold text-sm uppercase tracking-widest inline-flex items-center justify-center gap-2 hover:bg-white/85 transition-colors duration-200">
              <SocialIcon platform="whatsapp" className="h-4 w-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="h-12 w-14 rounded-none border border-white/30 inline-flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services */}
      {services.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.services}</h2>
          <div className="grid gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="border border-gray-200 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-gray-900">{s.title}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold text-gray-900">{s.price.toLocaleString()} <span className="text-xs font-medium text-gray-400">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 items-center px-4 border border-gray-900 text-black text-xs font-semibold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors duration-200">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-2 gap-2">
            {portfolio.map((p) => (
              <div key={p.id} className="relative aspect-[2/3] overflow-hidden bg-gray-100">
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">{msg.socials}</h2>
          <div className="grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 border border-gray-200 text-gray-700 inline-flex items-center justify-center gap-2 hover:border-gray-900 hover:text-gray-900 transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
```

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/StudioTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/StudioTemplate.tsx src/components/templates/__tests__/StudioTemplate.test.tsx
git commit -m "feat(templates): StudioTemplate (pro) + smoke test"
```

---

## Task 10: EditoTemplate + smoke test

**Files:**
- Create: `src/components/templates/EditoTemplate.tsx`
- Test: `src/components/templates/__tests__/EditoTemplate.test.tsx`

**Step 1: Failing test**

`src/components/templates/__tests__/EditoTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EditoTemplate } from "../EditoTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("EditoTemplate", () => {
  it("renders the serif editorial layout", () => {
    render(<EditoTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Photographe à Abidjan")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/EditoTemplate.test.tsx`
Expected: FAIL.

**Step 3: Implement**

Design: crème background, serif (EB Garamond) name, bio as pull-quote with a big serif quote glyph, services as a menu with dotted leader to the price, portfolio 2-col spaced, socials as serif text links, testimonials inside serif quote cards.

`src/components/templates/EditoTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const SERIF = { fontFamily: "var(--font-garamond, Georgia, serif)" };

export function EditoTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header */}
      <header className="text-center pt-4 pb-2">
        <Avatar profile={profile} className="h-20 w-20 ring-4 ring-[#FAF7F2] shadow-lg" />
        <h1 style={SERIF} className="mt-5 text-4xl font-medium text-[#1C1917]">
          {profile.display_name}
        </h1>
        <p className="mt-2 text-sm italic text-[#B07D3D]">{profile.tagline}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-[#1C1917]/50">{profile.city}, {profile.country}</p>
        {profile.bio && (
          <blockquote style={SERIF} className="mt-8 text-lg leading-8 text-[#1C1917]/80 border-t border-[#1C1917]/15 border-b py-6 px-2">
            “{profile.bio}”
          </blockquote>
        )}
        <div className="mt-8 flex gap-3 w-full max-w-[400px] mx-auto">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-full bg-[#B07D3D] text-white font-medium inline-flex items-center justify-center gap-2 hover:bg-[#96702f] transition-colors duration-200 shadow-md shadow-[#B07D3D]/25">
            <SocialIcon platform="whatsapp" className="w-4 h-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-full border border-[#1C1917]/20 inline-flex items-center justify-center text-[#1C1917] hover:bg-[#1C1917]/5 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — menu style */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.services}</h2>
          <div className="mt-5">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="border-b border-[#1C1917]/10 py-4 flex items-baseline gap-2">
                  <div className="min-w-0">
                    <p className="inline font-medium text-[#1C1917]">{s.title}</p>
                    {s.description && <p className="text-sm text-[#1C1917]/55 mt-0.5">{s.description}</p>}
                  </div>
                  <span className="flex-1 border-b border-dotted border-[#1C1917]/25" aria-hidden="true" />
                  {s.price != null && <p style={SERIF} className="shrink-0 text-lg text-[#B07D3D]">{s.price.toLocaleString()} <span className="text-xs">{s.currency}</span></p>}
                  <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 ml-2 text-xs font-medium text-[#B07D3D] underline underline-offset-4 hover:text-[#96702f]">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.portfolio}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
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

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.testimonials.title}</h2>
          <div className="mt-5 flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </section>
      )}

      {/* Socials — text links */}
      {socials.length > 0 && (
        <section className="mt-10">
          <h2 style={SERIF} className="text-xl italic text-[#1C1917]">{msg.socials}</h2>
          <div className="mt-3 flex flex-col">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="py-2.5 border-b border-[#1C1917]/10 flex items-center gap-3 text-sm font-medium text-[#1C1917] hover:text-[#B07D3D] transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-4 h-4" />
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

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/EditoTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/EditoTemplate.tsx src/components/templates/__tests__/EditoTemplate.test.tsx
git commit -m "feat(templates): EditoTemplate (pro, serif) + smoke test"
```

---

## Task 11: UrbanTemplate + smoke test

**Files:**
- Create: `src/components/templates/UrbanTemplate.tsx`
- Test: `src/components/templates/__tests__/UrbanTemplate.test.tsx`

**Step 1: Failing test**

`src/components/templates/__tests__/UrbanTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { UrbanTemplate } from "../UrbanTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("UrbanTemplate", () => {
  it("renders the vibrant layout", () => {
    render(<UrbanTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/UrbanTemplate.test.tsx`
Expected: FAIL.

**Step 3: Implement**

Design: white/off background, Sora display name, gradient avatar, tagline chip, services as colorful pill cards with violet accent buttons, portfolio dynamic grid (2-col with varied aspect), socials as colored circles.

`src/components/templates/UrbanTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { initials } from "./shared";
import type { TemplateProps } from "./types";

const DISPLAY = { fontFamily: "var(--font-sora, ui-sans-serif, sans-serif)" };

export function UrbanTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  return (
    <>
      {/* Header */}
      <header className="text-center pt-2">
        {profile.avatar_url ? (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] p-1 shadow-lg shadow-[#7C3AED]/25">
            <Image src={profile.avatar_url} alt={profile.display_name} width={104} height={104} className="h-full w-full rounded-full object-cover ring-4 ring-white" />
          </div>
        ) : (
          <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#7C3AED]/25">
            {initials(profile.display_name)}
          </div>
        )}
        <h1 style={DISPLAY} className="mt-5 text-3xl font-bold tracking-tight text-gray-900">{profile.display_name}</h1>
        <span className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] text-xs font-semibold">{profile.tagline}</span>
        <p className="mt-3 text-xs text-gray-400">{profile.city}, {profile.country}</p>
        {profile.bio && <p className="mt-5 text-sm leading-7 text-gray-600 max-w-md mx-auto">{profile.bio}</p>}
        <div className="mt-7 flex gap-3 w-full max-w-[400px] mx-auto">
          <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-2xl bg-[#7C3AED] text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#6D28D9] transition-colors duration-200 shadow-md shadow-[#7C3AED]/25">
            <SocialIcon platform="whatsapp" className="w-4 h-4" />
            {msg.whatsapp}
          </a>
          <a href={links.telLink} className="h-12 w-12 rounded-2xl border border-gray-200 bg-white inline-flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Services — pill cards */}
      {services.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.services}</h2>
          <div className="flex flex-col gap-3">
            {services.map((s, i) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              const chips = ["bg-[#F3E8FF] text-[#7C3AED]", "bg-[#FCE7F3] text-[#DB2777]", "bg-[#CFFAFE] text-[#0891B2]", "bg-[#FFF7ED] text-[#EA580C)"];
              const chip = chips[i % chips.length];
              return (
                <div key={s.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{s.title}</p>
                    {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                    <span className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${chip}`}>
                      {s.price != null ? `${s.price.toLocaleString()} ${s.currency}` : msg.demandBtn}
                    </span>
                  </div>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 h-10 px-4 rounded-2xl bg-[#7C3AED] text-white text-xs font-semibold inline-flex items-center justify-center hover:bg-[#6D28D9] transition-colors duration-200 shadow-sm shadow-[#7C3AED]/20">{msg.demandBtn}</a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — dynamic grid */}
      {portfolio.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {portfolio.map((p, i) => (
              <div key={p.id} className={`relative overflow-hidden rounded-2xl ${i % 3 === 0 ? "aspect-square col-span-2" : "aspect-square"}`}>
                <Image src={p.thumbnail_url || p.media_url} alt={p.title || ""} fill sizes="(max-width: 768px) 50vw, 300px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} starLabel={msg.testimonials.starsAria} date={formatTestimonialDate(locale, t.createdAt)} />
            ))}
          </div>
        </section>
      )}

      {/* Socials — colored circles */}
      {socials.length > 0 && (
        <section className="mt-9">
          <h2 style={DISPLAY} className="text-sm font-bold text-gray-900 mb-4">{msg.socials}</h2>
          <div className="flex flex-wrap gap-3">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] inline-flex items-center justify-center hover:bg-[#7C3AED] hover:text-white transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-5 h-5" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```
Note: fix the typo in the `chips` array `"text-[#EA580C)"` → `"text-[#EA580C]"` during implementation.

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/UrbanTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/UrbanTemplate.tsx src/components/templates/__tests__/UrbanTemplate.test.tsx
git commit -m "feat(templates): UrbanTemplate (pro, vibrant) + smoke test"
```

---

## Task 12: ObsidienneTemplate + smoke test

**Files:**
- Create: `src/components/templates/ObsidienneTemplate.tsx`
- Test: `src/components/templates/__tests__/ObsidienneTemplate.test.tsx`

**Step 1: Failing test**

`src/components/templates/__tests__/ObsidienneTemplate.test.tsx`:
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ObsidienneTemplate } from "../ObsidienneTemplate";
import { makeTemplateProps } from "./fixture";

afterEach(() => cleanup());

describe("ObsidienneTemplate", () => {
  it("renders the dark premium layout", () => {
    render(<ObsidienneTemplate {...makeTemplateProps()} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    expect(screen.getByText("Séance studio")).toBeInTheDocument();
    expect(screen.getByText("Me retrouver")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/templates/__tests__/ObsidienneTemplate.test.tsx`
Expected: FAIL.

**Step 3: Implement**

Design: black `#0B0B0F` background (template bgClass handles page; component itself paints text light + dark cards), gold accent `#D4AF37`, hero with gold hairline, services as dark cards with gold price, portfolio mosaic `grid-cols-6` spans, testimonials dark cards, socials dark outline.

`src/components/templates/ObsidienneTemplate.tsx`:
```tsx
import { buildWaLink, buildServiceWaMessage } from "@/lib/utils";
import Image from "next/image";
import { SocialIcon } from "@/components/socialIcons";
import { Avatar, formatTestimonialDate } from "./shared";
import type { TemplateProps } from "./types";

const CONDENSED = { fontFamily: "var(--font-archivo, 'Arial Narrow', sans-serif)" };
const GOLD = "#D4AF37";

export function ObsidienneTemplate({ profile, services, portfolio, socials, testimonials, msg, locale, links, trackClick }: TemplateProps) {
  const stars = (t: typeof testimonials[number]) =>
    t.rating != null ? { "aria-label": msg.testimonials.starsAria } : {};
  return (
    <>
      {/* Header */}
      <header className="pt-2 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="h-1.5 w-16 bg-[#D4AF37]" aria-hidden="true" />
          <h1 style={CONDENSED} className="mt-6 text-4xl font-bold uppercase tracking-wide text-white">{profile.display_name}</h1>
          <p className="mt-2 text-sm font-medium text-[#D4AF37]">{profile.tagline}</p>
          <p className="mt-3 text-xs text-white/40">{profile.city}, {profile.country}</p>
          {profile.bio && <p className="mt-5 max-w-md text-sm leading-7 text-white/60">{profile.bio}</p>}
          <div className="mt-8 flex gap-3 w-full max-w-[400px]">
            <a href={links.mainWa} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 rounded-xl bg-[#D4AF37] text-black font-bold inline-flex items-center justify-center gap-2 hover:bg-[#e5c65a] transition-colors duration-200 shadow-md shadow-[#D4AF37]/20">
              <SocialIcon platform="whatsapp" className="w-4 h-4" />
              {msg.whatsapp}
            </a>
            <a href={links.telLink} className="h-12 w-14 rounded-xl border border-white/20 inline-flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Services */}
      {services.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.services}</h2>
          <div className="flex flex-col gap-3">
            {services.map((s) => {
              const href = trackClick(`click_service_${s.id}`, buildWaLink(profile.phone_e164, buildServiceWaMessage(s.title, s.price, s.currency)));
              return (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{s.title}</p>
                    {s.description && <p className="text-sm text-white/50 mt-0.5">{s.description}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    {s.price != null && <p className="text-lg font-bold" style={{ color: GOLD }}>{s.price.toLocaleString()} <span className="text-xs font-medium text-white/50">{s.currency}</span></p>}
                    <a href={href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex h-9 items-center px-4 rounded-lg border border-[#D4AF37]/60 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-black transition-colors duration-200">{msg.demandBtn}</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Portfolio — unique mosaic */}
      {portfolio.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.portfolio}</h2>
          <div className="grid grid-cols-6 gap-2">
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

      {/* Testimonials — custom dark cards */}
      {testimonials.length > 0 && (
        <section className="mt-10">
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.testimonials.title}</h2>
          <div className="flex flex-col gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37]/20 text-sm font-bold text-[#D4AF37]">{t.authorName.trim().charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{t.authorName}</p>
                    {t.authorRole && <p className="truncate text-xs text-white/40">{t.authorRole}</p>}
                  </div>
                  {t.rating != null && <div role="img" {...stars(t)} className="text-[#D4AF37] text-xs">{"★".repeat(Math.max(1, Math.min(5, Math.round(t.rating))))}</div>}
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
          <h2 style={CONDENSED} className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-4">{msg.socials}</h2>
          <div className="grid grid-cols-3 gap-2">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl border border-white/15 text-white inline-flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors duration-200">
                <SocialIcon platform={s.platform} className="w-4 h-4" />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
```

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/templates/__tests__/ObsidienneTemplate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/templates/ObsidienneTemplate.tsx src/components/templates/__tests__/ObsidienneTemplate.test.tsx
git commit -m "feat(templates): ObsidienneTemplate (pro, dark) + smoke test"
```

---

## Task 13: Template registry module — TDD

**Files:**
- Create: `src/lib/templates.ts`
- Test: `src/lib/__tests__/templates.test.ts`

**Step 1: Write the failing test**

`src/lib/__tests__/templates.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { TEMPLATES, getTemplate } from "../templates";

describe("templates registry", () => {
  it("exposes the 6 templates in config order", () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual([
      "minimal",
      "portfolio",
      "studio",
      "edito",
      "urban",
      "obsidienne",
    ]);
  });

  it("keeps free tier on the two first entries", () => {
    expect(TEMPLATES[0].tier).toBe("free");
    expect(TEMPLATES[1].tier).toBe("free");
    expect(TEMPLATES[2].tier).toBe("pro");
  });

  it("resolves a template by id", () => {
    expect(getTemplate("edito").id).toBe("edito");
  });

  it("falls back to minimal for unknown/null/undefined ids", () => {
    expect(getTemplate(null).id).toBe("minimal");
    expect(getTemplate(undefined).id).toBe("minimal");
    expect(getTemplate("bogus").id).toBe("minimal");
  });

  it("provides a component for every template", () => {
    for (const t of TEMPLATES) {
      expect(typeof t.Component).toBe("function");
    }
  });
});
```

**Step 2: Run to verify it fails**

Run: `npx vitest run src/lib/__tests__/templates.test.ts`
Expected: FAIL (module not found).

**Step 3: Implement**

`src/lib/templates.ts`:
```ts
import type { ComponentType } from "react";
import type { Template } from "@/types/database";
import {
  TEMPLATE_CONFIGS,
  getTemplateConfig,
  canUseTemplate,
  type TemplateConfig,
} from "@/lib/template-config";
import type { TemplateProps } from "@/components/templates/types";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { PortfolioTemplate } from "@/components/templates/PortfolioTemplate";
import { StudioTemplate } from "@/components/templates/StudioTemplate";
import { EditoTemplate } from "@/components/templates/EditoTemplate";
import { UrbanTemplate } from "@/components/templates/UrbanTemplate";
import { ObsidienneTemplate } from "@/components/templates/ObsidienneTemplate";

export type { TemplateProps };

export { canUseTemplate, getTemplateConfig, isTemplateId };
export type { TemplateConfig };

export interface TemplateDefinition extends TemplateConfig {
  /** Outer page background applied by the renderer around the template sections. */
  bgClass: string;
  Component: ComponentType<TemplateProps>;
}

const COMPONENTS: Record<Template, ComponentType<TemplateProps>> = {
  minimal: MinimalTemplate,
  portfolio: PortfolioTemplate,
  studio: StudioTemplate,
  edito: EditoTemplate,
  urban: UrbanTemplate,
  obsidienne: ObsidienneTemplate,
};

const BG_CLASS: Record<Template, string> = {
  minimal: "bg-white",
  portfolio: "bg-white",
  studio: "bg-white",
  edito: "bg-[#FAF7F2]",
  urban: "bg-white",
  obsidienne: "bg-[#0B0B0F]",
};

export const TEMPLATES: TemplateDefinition[] = TEMPLATE_CONFIGS.map((cfg) => ({
  ...cfg,
  bgClass: BG_CLASS[cfg.id],
  Component: COMPONENTS[cfg.id],
}));

/** Resolve a template definition by id (fallback: minimal). */
export function getTemplate(id: string | null | undefined): TemplateDefinition {
  const cfg = getTemplateConfig(id);
  return TEMPLATES.find((t) => t.id === cfg.id)!;
}
```

**Step 4: Run to verify it passes**

Run: `npx vitest run src/lib/__tests__/templates.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/templates.ts src/lib/__tests__/templates.test.ts
git commit -m "feat(templates): template registry module"
```

---

## Task 14: ProfileView renderer + refactor the public page

**Files:**
- Create: `src/app/[username]/ProfileView.tsx`
- Modify: `src/app/[username]/page.tsx` (remove inline layout, dispatch to `ProfileView`)
- Test: `src/app/[username]/__tests__/ProfileView.test.tsx`

**Step 1: Write the renderer**

`src/app/[username]/ProfileView.tsx`:
```tsx
import Link from "next/link";
import { buildWaLink, buildMainWaMessage } from "@/lib/utils";
import { getTemplate } from "@/lib/templates";
import type { Messages } from "@/lib/i18n/messages";
import type { PublicProfileData } from "@/lib/supabase/queries";
import type { TemplateProps } from "@/components/templates/types";
import { WhatsAppFloating } from "@/components/WhatsAppFloating";
import { ViewTracker } from "@/components/ViewTracker";
import { ServiceViewTracker } from "@/components/ServiceViewTracker";
import { SocialIcon } from "@/components/socialIcons";
import { TestimonialForm } from "@/components/TestimonialForm";

export interface ProfileViewProps extends Omit<PublicProfileData, "profile"> {
  profile: PublicProfileData["profile"];
  locale: string;
  msg: Messages;
}

export function ProfileView({
  profile,
  services,
  portfolio,
  socials,
  testimonials,
  locale,
  msg,
}: ProfileViewProps) {
  const template = getTemplate(profile.template);
  const pid = profile.id;
  const mainWaRaw = buildWaLink(profile.phone_e164, buildMainWaMessage(profile.display_name));
  const telLink = `tel:${profile.phone_e164}`;
  const trackClick = (type: string, to: string) =>
    `/api/track-click?pid=${pid}&type=${type}&to=${encodeURIComponent(to)}`;

  const props: TemplateProps = {
    profile,
    services,
    portfolio,
    socials,
    testimonials,
    msg: msg.profile,
    locale,
    links: { mainWa: trackClick("click_main", mainWaRaw), telLink },
    trackClick,
  };

  return (
    <div className={`min-h-screen ${template.bgClass}`}>
      <div className="max-w-[640px] mx-auto px-4 py-8 pb-28 sm:pb-8">
        <template.Component {...props} />

        {testimonials.length > 0 && <TestimonialForm profileId={pid} />}

        <p className="text-center text-xs text-gray-400 mt-12">
          {msg.profile.madeWith}{" "}
          <Link href="/" className="font-medium text-accent">
            Bizko
          </Link>{" "}
          - bizko.pro/{profile.username}
        </p>
      </div>

      {/* Sticky WhatsApp CTA - mobile only */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100/60 bg-white/95 backdrop-blur-xl p-4 flex justify-center sm:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <a href={trackClick("click_sticky", mainWaRaw)} target="_blank" rel="noopener noreferrer" className="h-12 w-full max-w-[640px] rounded-2xl bg-whatsapp text-white font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25">
          <SocialIcon platform="whatsapp" />
          {msg.profile.stickyWa}
        </a>
      </div>

      {/* Floating WhatsApp - desktop only */}
      <WhatsAppFloating href={trackClick("click_floating", mainWaRaw)} />

      {/* Trackers (client, SSR path stays cache-friendly) */}
      <ViewTracker profileId={profile.id} />
      {services.length > 0 && <ServiceViewTracker serviceIds={services.map((s) => s.id)} />}
    </div>
  );
}
```
Note: dark templates (obsidienne) inherit a light sticky CTA bar — acceptable MVP; if needed adjust per-template later. The footer text color stays gray on dark pages: for `obsidienne` this is low-contrast. Mitigate by using `template.bgClass === "bg-[#0B0B0F]" ? "text-white/30" : "text-gray-400"` in the footer `<p className>` — implement this conditional during implementation.

**Step 2: Rewrite the page as a dispatcher**

`src/app/[username]/page.tsx` — keep `generateMetadata` unchanged; replace the default export body:
```tsx
export default async function PublicProfile({ params }: Props) {
  const { username } = await params;
  const data = await getCachedPublicProfileData(username);

  if (!data) notFound();

  const locale = await resolveServerLocale();
  const msg = getMessages(locale);

  return <ProfileView {...data} locale={locale} msg={msg} />;
}
```
Remove the now-unused imports from `page.tsx`: `buildWaLink`, `buildMainWaMessage`, `buildServiceWaMessage`, `Link`, `Image`, `WhatsAppFloating`, `PortfolioGallery`, `ViewTracker`, `ServiceViewTracker`, `SocialIcon`, `TestimonialCard`, `TestimonialForm`.
Keep: `notFound`, `Metadata`, `getMessages`, `resolveServerLocale`, `getCachedPublicProfileData`, and add `ProfileView`.

**Step 3: Write the renderer test**

`src/app/[username]/__tests__/ProfileView.test.tsx`: use a minimal profile fixture; render `<ProfileView>` with `profile.template = "studio"`, assert the display name appears and a WhatsApp anchor exists.
```tsx
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ProfileView } from "../ProfileView";

afterEach(() => cleanup());

const msg = {
  profile: {
    services: "Mes services",
    portfolio: "Mes réalisations",
    socials: "Me retrouver",
    whatsapp: "WhatsApp",
    call: "Appeler",
    demandBtn: "Demander",
    madeWith: "Fait avec",
    stickyWa: "Discuter sur WhatsApp",
    testimonials: { title: "Témoignages", subtitle: "…", starsAria: "Note" },
  },
} as any;

function props(template = "studio") {
  return {
    profile: {
      id: "p1", username: "awa_photo", display_name: "Awa Konaté", tagline: "Photographe à Abidjan",
      bio: null, city: "Abidjan", country: "CI", phone_e164: "+2250700000000",
      email_public: null, template, locale: "fr", avatar_url: null,
    },
    services: [], portfolio: [], socials: [], testimonials: [],
    locale: "fr", msg,
  };
}

describe("ProfileView", () => {
  it("renders the resolved template and tracked CTA", () => {
    render(<ProfileView {...props("studio")} />);
    expect(screen.getByText("Awa Konaté")).toBeInTheDocument();
    const wa = screen.getAllByRole("link").find((a) => (a as HTMLAnchorElement).getAttribute("href")?.includes("api/track-click"));
    expect(wa).toBeTruthy();
  });
});
```

**Step 4: Run the renderer test + full suite**

Run: `npx vitest run src/app/[username]/__tests__/ProfileView.test.tsx src/components/templates src/lib/__tests__/templates.test.ts`
Expected: PASS.

**Step 5: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/app/[username]/ProfileView.tsx src/app/[username]/page.tsx src/app/[username]/__tests__/ProfileView.test.tsx
git commit -m "refactor(profile): dispatch public page through template registry + shared overlay"
```

---

## Task 15: i18n keys for templates

**Files:**
- Modify: `messages/fr.json` (namespace `dashboard`)
- Modify: `messages/en.json` (namespace `dashboard`)

**Step 1: Add FR keys**

In `messages/fr.json` → `dashboard` object, after `"templatePortfolio": "Portfolio"` (line ~301), add:
```json
"templateStudio": "Studio",
"templateEdito": "Édito",
"templateUrban": "Urban",
"templateObsidienne": "Obsidienne",
"templateDescMinimal": "Épuré et professionnel. Met le contenu en avant.",
"templateDescPortfolio": "La grille visuelle domine. Idéal pour les créatifs.",
"templateDescStudio": "Noir & blanc, typo condensée. Un rendu studio premium.",
"templateDescEdito": "Serif élégant, ambiance carte de visite de luxe.",
"templateDescUrban": "Couleurs vibrantes et énergie urbaine. Pour marquer les esprits.",
"templateDescObsidienne": "Sombre et raffiné, accents dorés. Pour ceux qui sortent du lot.",
"templateLocked": "Pro",
"errorTemplateLocked": "Ce template nécessite Bizko Pro.",
```
(Keep existing `"templateMinimal"` and `"templatePortfolio"` lines.)

**Step 2: Add EN keys**

In `messages/en.json` → `dashboard`, after `"templatePortfolio": "Portfolio"`, add:
```json
"templateStudio": "Studio",
"templateEdito": "Serif",
"templateUrban": "Urban",
"templateObsidienne": "Onyx",
"templateDescMinimal": "Clean and professional. Content comes first.",
"templateDescPortfolio": "The visual grid leads. Ideal for creatives.",
"templateDescStudio": "Black & white, condensed type. A premium studio look.",
"templateDescEdito": "Elegant serif, luxury business-card mood.",
"templateDescUrban": "Vibrant colors and urban energy. Made to stand out.",
"templateDescObsidienne": "Dark and refined with gold accents. For those who stand out.",
"templateLocked": "Pro",
"errorTemplateLocked": "This template requires Bizko Pro.",
```

**Step 3: Verify JSON validity + types**

Run: `npx tsc --noEmit`
Expected: PASS (`Messages` type derives from the JSON, so keys must exist in both files).

**Step 4: Commit**

```bash
git add messages/fr.json messages/en.json
git commit -m "feat(i18n): template names/descriptions + pro lock copy"
```

---

## Task 16: TemplatePicker component — TDD

**Files:**
- Create: `src/components/dashboard/TemplatePicker.tsx`
- Test: `src/components/dashboard/__tests__/TemplatePicker.test.tsx`

**Step 1: Failing test**

`src/components/dashboard/__tests__/TemplatePicker.test.tsx`:
```tsx
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TemplatePicker } from "../TemplatePicker";

vi.mock("@/lib/i18n/provider", () => ({
  useI18n: () => ({
    t: (k: string) =>
      k === "dashboard.templateStudio" ? "Studio"
      : k === "dashboard.templateDescStudio" ? "Noir & blanc, typo condensée."
      : k,
  }),
}));

afterEach(() => cleanup());

describe("TemplatePicker", () => {
  it("renders 6 cards with current selected", () => {
    render(<TemplatePicker current="portfolio" isPro />);
    expect(screen.getByText("Studio")).toBeInTheDocument();
    const selected = screen.getByText("Portfolio").closest("button");
    expect(selected).toBeTruthy();
  });

  it("shows a pro lock for free users on pro templates", () => {
    render(<TemplatePicker current="minimal" isPro={false} />);
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);
  });
});
```
Note: with the mocked i18n only some keys resolve; the component must not crash on unknown keys. During implementation, guard unknown keys with a fallback (`t(k) || id`).

**Step 2: Run to verify it fails**

Run: `npx vitest run src/components/dashboard/__tests__/TemplatePicker.test.tsx`
Expected: FAIL (module not found).

**Step 3: Implement**

`src/components/dashboard/TemplatePicker.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATE_CONFIGS } from "@/lib/template-config";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  current: string;
  isPro: boolean;
}

export function TemplatePicker({ current, isPro }: TemplatePickerProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(current);
  const lockedId = selected ? (TEMPLATE_CONFIGS.find((c) => c.id === selected)?.tier === "pro" && !isPro ? selected : null) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATE_CONFIGS.map((cfg) => {
          const active = selected === cfg.id;
          const locked = cfg.tier === "pro" && !isPro;
          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setSelected(cfg.id)}
              aria-pressed={active}
              className={cn(
                "relative rounded-2xl border p-4 text-left transition-all duration-200",
                active ? "border-accent ring-2 ring-accent/20" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                  {cfg.nameKey.slice(-9, -8).toUpperCase() || cfg.id.slice(0, 1).toUpperCase()}
                </span>
                {locked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold uppercase tracking-wider">
                    {t("dashboard.templateLocked")}
                  </span>
                ) : active ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{t(cfg.nameKey) || cfg.id}</p>
              <p className="mt-1 text-[11px] leading-4 text-gray-500 line-clamp-2">{t(cfg.descriptionKey) || ""}</p>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="template" value={selected} />
      {lockedId && (
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors duration-200"
        >
          {t("dashboard.upgradeCta")}
        </Link>
      )}
    </div>
  );
}
```
(Use a deterministic avatar letter: `cfg.id[0].toUpperCase()` instead of the fragile `nameKey.slice` expression — implement with `cfg.id[0].toUpperCase()`.)

**Step 4: Run to verify it passes**

Run: `npx vitest run src/components/dashboard/__tests__/TemplatePicker.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/dashboard/TemplatePicker.tsx src/components/dashboard/__tests__/TemplatePicker.test.tsx
git commit -m "feat(dashboard): visual template picker with pro lock"
```

---

## Task 17: Wire the picker into TabSettings

**Files:**
- Modify: `src/components/dashboard/TabSettings.tsx`

**Step 1: Edit TabSettings**

- Add prop `isPro: boolean` to the component signature.
- Replace the `CustomSelect` template block (lines ~45-53) with `<TemplatePicker current={profile.template} isPro={isPro} />`.
- Remove the now-unused `CustomSelect` import and the `template` `<CustomSelect>` block (keep `locale`/other selects if they exist elsewhere in the file — check first; only remove template usage).
- Add import: `import { TemplatePicker } from "./TemplatePicker";`

**Step 2: Update the caller**

`src/app/dashboard/DashboardClient.tsx`:
- Render `<TabSettings ... isPro={isPro} />` where TabSettings is currently rendered inside the `reglages` tab (check the file tail). Pass `isPro={isPro}`.

**Step 3: Typecheck + tests**

Run: `npx tsc --noEmit && npx vitest run src/components/dashboard`
Expected: PASS.

**Step 4: Commit**

```bash
git add src/components/dashboard/TabSettings.tsx src/app/dashboard/DashboardClient.tsx
git commit -m "feat(dashboard): use template picker in settings tab"
```

---

## Task 18: Server-side plan gating in updateProfile

**Files:**
- Modify: `src/app/dashboard/actions.ts`

**Step 1: Add a `currentPlan` helper**

After `currentLimits`, add:
```ts
async function currentPlan(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "free" as const;
  const { data: isPro } = await supabase.rpc("is_pro", { p_profile_id: user.id });
  return isPro ? ("pro" as const) : ("free" as const);
}
```
Refactor `currentLimits` to reuse it (DRY):
```ts
async function currentLimits(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const plan = await currentPlan(supabase);
  return getLimits(plan);
}
```

**Step 2: Gate the template in `updateProfile`**

Import `canUseTemplate` from `@/lib/template-config` (NOT `templates.ts`, to keep the action free of React components).

After the existing validations and before the `.update`, add:
```ts
const plan = await currentPlan(supabase);
if (!canUseTemplate(plan, template)) {
  redirect("/dashboard?error=template_locked");
}
```

**Step 3: Register the error key**

`src/app/dashboard/DashboardClient.tsx` `ERROR_KEYS` map: add `template_locked: "dashboard.errorTemplateLocked"`.

**Step 4: Typecheck + tests**

Run: `npx tsc --noEmit && npm run test:run`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/dashboard/actions.ts src/app/dashboard/DashboardClient.tsx
git commit -m "feat(dashboard): block locked templates server-side for free users"
```

---

## Task 19: Final verification pass

**Files:** none (commands only)

**Step 1: Run all checks**

```bash
npm run test:run
npm run lint
npm run build
```
Expected: all green.

**Step 2: Manual smoke checks**
- `npm run dev` → a free profile's settings: picker shows 2 unlocked + 4 locked, saving a locked template shows the error banner.
- A pro profile can save `studio`; public `/[username]` renders the dark Studio hero; `/?username=demo` (or existing demo) still looks correct.
- Verify `[username]` page for `template: "obsidienne"` shows a dark page (footer legibility conditional from Task 14).

**Step 3: Commit any remaining fixups**

```bash
git add -A
git commit -m "chore: template system final polish"
```

---

## Out of scope (do NOT do here)
- Branding removal / accent color customization (separate Pro features).
- Explore page template-aware card styling.
- Downgrade enforcement for existing pro-template profiles.

## Execution handoff
Plan complete and saved to `docs/plans/2026-09-06-templates-implementation.md`.

Two execution options:
1. **Subagent-Driven (this session)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Parallel Session (separate)** — open a new session with `executing-plans`, batch execution with checkpoints.