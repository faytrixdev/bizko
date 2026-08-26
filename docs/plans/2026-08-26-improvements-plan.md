# Bizko — Plan d'améliorations MVP

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Améliorer la qualité du code Bizko en extrayant les composants, complétant l'i18n, ajoutant la validation username, le drag & drop, la config Next.js, et des tests.

**Architecture:** Extraction progressive des composants depuis les pages vers `src/components/`, puis application de l'i18n sur les textes hardcoded, puis ajout des fonctionnalités manquantes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase, TypeScript

---

## Phase 1 — Extraction des composants réutilisables

### Task 1.1: Déplacer les composants auth vers `src/components/`

**Files:**
- Move: `src/app/(auth)/components.tsx` → `src/components/auth/AuthShell.tsx`, `src/components/auth/Field.tsx`, `src/components/auth/Input.tsx`, `src/components/auth/PasswordInput.tsx`, `src/components/auth/SubmitButton.tsx`, `src/components/auth/Alert.tsx`
- Modify: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/app/(auth)/verify-email/page.tsx`

**Step 1: Create `src/components/auth/` directory**

```bash
mkdir -p src/components/auth
```

**Step 2: Create individual auth component files**

Create `src/components/auth/AuthShell.tsx`:
```tsx
import Link from "next/link";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px]">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 mx-auto">
          <span className="font-bold font-display text-gray-900 text-lg">
            Bizko<span className="text-[#FF6B35]">.</span>
          </span>
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-[26px] font-bold tracking-tide font-display text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
```

Create `src/components/auth/Field.tsx`:
```tsx
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[13px] font-medium text-gray-900">
        {label}
        {hint && <span className="font-normal text-gray-500">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
```

Create `src/components/auth/Input.tsx`:
```tsx
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const { error, className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={`h-11 w-full rounded-lg border bg-white px-4 text-[14px] placeholder:text-gray-400 outline-none transition
        ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"}
        ${className}`}
    />
  );
}
```

Create `src/components/auth/PasswordInput.tsx`:
```tsx
"use client";
import { useState } from "react";
import { Input } from "./Input";

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Masquer" : "Afficher"}
        className="absolute right-1 top-1 h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
      >
        <span className="text-[11px] font-medium tracking-widest uppercase">{show ? "Masquer" : "Voir"}</span>
      </button>
    </div>
  );
}
```

Create `src/components/auth/SubmitButton.tsx`:
```tsx
"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 w-full rounded-lg bg-[#FF6B35] text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition hover:bg-[#EA580C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
      {children}
    </button>
  );
}
```

Create `src/components/auth/Alert.tsx`:
```tsx
export function Alert({ type = "error", children }: { type?: "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className={`flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm leading-5 ${
        type === "error" ? "bg-red-50 border-red-200/60 text-red-700" : "bg-emerald-50 border-emerald-200/60 text-emerald-800"
      }`}
    >
      <span className="mt-0.5 text-xs">{type === "error" ? "!" : "+"}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}
```

Create `src/components/auth/index.ts` (barrel export):
```tsx
export { AuthShell } from "./AuthShell";
export { Field } from "./Field";
export { Input } from "./Input";
export { PasswordInput } from "./PasswordInput";
export { SubmitButton } from "./SubmitButton";
export { Alert } from "./Alert";
```

**Step 3: Update all auth page imports**

Replace `from "../components"` with `from "@/components/auth"` in:
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`
- `src/app/(auth)/verify-email/page.tsx`

**Step 4: Delete old file**

Remove `src/app/(auth)/components.tsx`

**Step 5: Run lint**

Run: `npm run lint`
Expected: PASS

---

### Task 1.2: Déplacer QrShare et Upload vers `src/components/`

**Files:**
- Move: `src/app/dashboard/QrShare.tsx` → `src/components/QrShare.tsx`
- Move: `src/app/dashboard/Upload.tsx` → `src/components/Upload.tsx`
- Modify: `src/app/dashboard/DashboardClient.tsx` (imports)

**Step 1: Move files**

Move `src/app/dashboard/QrShare.tsx` to `src/components/QrShare.tsx`
Move `src/app/dashboard/Upload.tsx` to `src/components/Upload.tsx`

**Step 2: Update imports in DashboardClient.tsx**

```tsx
// Before
import { QrShare } from "./QrShare";
import { AvatarUpload, PortfolioUpload } from "./Upload";

// After
import { QrShare } from "@/components/QrShare";
import { AvatarUpload, PortfolioUpload } from "@/components/Upload";
```

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

---

### Task 1.3: Extraire les composants du dashboard en onglets séparés

**Files:**
- Create: `src/components/dashboard/TabOverview.tsx`
- Create: `src/components/dashboard/TabServices.tsx`
- Create: `src/components/dashboard/TabPortfolio.tsx`
- Create: `src/components/dashboard/TabSocials.tsx`
- Create: `src/components/dashboard/TabSettings.tsx`
- Create: `src/components/dashboard/index.ts`
- Modify: `src/app/dashboard/DashboardClient.tsx` (refactor to use tab components)

**Step 1: Create `src/components/dashboard/` directory**

```bash
mkdir -p src/components/dashboard
```

**Step 2: Extract each tab into its own component**

Create `src/components/dashboard/TabOverview.tsx`:
```tsx
import Link from "next/link";
import { QrShare } from "@/components/QrShare";

interface TabOverviewProps {
  publicUrl: string;
  views: number;
  waClicks: number;
}

export function TabOverview({ publicUrl, views, waClicks }: TabOverviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold font-display text-sm text-gray-900">Partage ton Bizko</h2>
        <p className="text-xs text-gray-500 mt-2 break-all font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {publicUrl}
        </p>
        <div className="mt-3">
          <QrShare url={publicUrl} />
        </div>
        <Link href={`/${publicUrl.split("/").pop()}`} target="_blank" className="inline-flex mt-3 text-xs font-medium text-[#FF6B35] hover:underline">
          Previsualiser mon profil
        </Link>
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold font-display text-sm text-gray-900">Analytics</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold font-display text-gray-900">{views}</p>
            <p className="text-xs text-gray-500">Vues</p>
          </div>
          <div className="rounded-lg bg-gray-900 text-white p-4 text-center">
            <p className="text-2xl font-bold font-display">{waClicks}</p>
            <p className="text-xs text-gray-400">Clics WhatsApp</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/dashboard/TabServices.tsx`:
```tsx
"use client";
import { addService, deleteService } from "@/app/dashboard/actions";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  position: number;
}

interface TabServicesProps {
  services: Service[];
}

export function TabServices({ services }: TabServicesProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">Services ({services.length}/8)</h2>
      {services.length >= 8 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Limite 8 services atteinte.
        </p>
      ) : (
        <form action={addService} className="mt-3 flex flex-col gap-2">
          <input name="title" required placeholder="Titre" maxLength={60} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <div className="flex gap-2">
            <input name="price" type="number" placeholder="Prix" min={0} className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
            <input name="currency" defaultValue="XOF" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          </div>
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
            Ajouter
          </button>
        </form>
      )}
      <div className="mt-4 flex flex-col gap-2">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-gray-900">{s.title}</p>
              {s.price != null && (
                <p className="text-xs text-gray-500">
                  {s.price.toLocaleString()} {s.currency}
                </p>
              )}
            </div>
            <form action={deleteService}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                Supprimer
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/dashboard/TabPortfolio.tsx`:
```tsx
import { deletePortfolio } from "@/app/dashboard/actions";
import { PortfolioUpload } from "@/components/Upload";

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string | null;
  position: number;
}

interface TabPortfolioProps {
  portfolio: PortfolioItem[];
  profileId: string;
}

export function TabPortfolio({ portfolio, profileId }: TabPortfolioProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold font-display text-sm text-gray-900">Portfolio ({portfolio.length}/9)</h2>
        {portfolio.length >= 9 ? (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
            Limite atteinte
          </span>
        ) : (
          <PortfolioUpload profileId={profileId} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {portfolio.map((p) => (
          <div key={p.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url} alt="" className="aspect-square object-cover rounded-lg border border-gray-200" />
            <form action={deletePortfolio} className="absolute top-1 right-1">
              <input type="hidden" name="id" value={p.id} />
              <button className="bg-white/90 backdrop-blur text-xs w-6 h-6 rounded-lg border border-gray-200 hover:bg-white">
                x
              </button>
            </form>
          </div>
        ))}
      </div>
      {portfolio.length === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center py-8">
          Aucune image — ajoute tes realisations.
        </p>
      )}
    </div>
  );
}
```

Create `src/components/dashboard/TabSocials.tsx`:
```tsx
"use client";
import { addSocial, deleteSocial } from "@/app/dashboard/actions";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  position: number;
}

interface TabSocialsProps {
  socials: SocialLink[];
}

export function TabSocials({ socials }: TabSocialsProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">Reseaux sociaux ({socials.length}/6)</h2>
      {socials.length >= 6 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Limite 6 liens atteinte.
        </p>
      ) : (
        <form action={addSocial} className="mt-3 flex flex-col gap-2">
          <select name="platform" className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
            <option value="facebook">Facebook</option>
            <option value="x">X</option>
            <option value="youtube">YouTube</option>
            <option value="website">Website</option>
          </select>
          <input name="url" required placeholder="https://..." className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-medium hover:bg-[#EA580C]">
            Ajouter
          </button>
        </form>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {socials.map((s) => (
          <div key={s.id} className="flex items-center justify-between border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5">
            <span className="text-sm truncate text-gray-900">
              {s.platform}: <span className="text-gray-500 font-normal">{s.url}</span>
            </span>
            <form action={deleteSocial}>
              <input type="hidden" name="id" value={s.id} />
              <button className="text-xs text-red-600 hover:underline shrink-0 ml-3">
                x
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/dashboard/TabSettings.tsx`:
```tsx
import { updateProfile } from "@/app/dashboard/actions";
import { AvatarUpload } from "@/components/Upload";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  tagline: string;
  bio: string | null;
  city: string;
  country: string;
  phone_e164: string;
  email_public: string | null;
  template: string;
  avatar_url: string | null;
}

interface TabSettingsProps {
  profile: Profile;
}

export function TabSettings({ profile }: TabSettingsProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">Parametres du profil</h2>
      <div className="mt-3">
        <AvatarUpload profileId={profile.id} currentUrl={profile.avatar_url} />
      </div>
      <form action={updateProfile} className="mt-4 flex flex-col gap-3">
        <input name="display_name" defaultValue={profile.display_name} required placeholder="Nom" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <input name="tagline" defaultValue={profile.tagline} required placeholder="Tagline" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <textarea name="bio" defaultValue={profile.bio || ""} placeholder="Bio (280c)" maxLength={280} className="rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-gray-900 resize-none" rows={3} />
        <div className="flex gap-3">
          <input name="city" defaultValue={profile.city} required placeholder="Ville" className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
          <input name="country" defaultValue={profile.country} required placeholder="CI" className="w-20 h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        </div>
        <input name="phone_e164" defaultValue={profile.phone_e164} required placeholder="+2250700000000" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <input name="email_public" defaultValue={profile.email_public || ""} placeholder="Email public (optionnel)" className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
        <select name="template" defaultValue={profile.template} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm">
          <option value="minimal">Minimal</option>
          <option value="portfolio">Portfolio</option>
        </select>
        <button className="h-10 rounded-lg bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#EA580C] transition">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
```

Create `src/components/dashboard/index.ts`:
```tsx
export { TabOverview } from "./TabOverview";
export { TabServices } from "./TabServices";
export { TabPortfolio } from "./TabPortfolio";
export { TabSocials } from "./TabSocials";
export { TabSettings } from "./TabSettings";
```

**Step 3: Refactor DashboardClient.tsx to use extracted components**

Replace the inline tab content with imported components. The DashboardClient keeps the tab state and header, but delegates rendering to the tab components.

**Step 4: Run lint**

Run: `npm run lint`
Expected: PASS

---

### Task 1.4: Extraire le composant LocaleSwitch

**Files:**
- Create: `src/components/LocaleSwitch.tsx`
- Modify: `src/lib/i18n/provider.tsx` (keep provider, move LocaleSwitch out)
- Modify: `src/app/page.tsx`, `src/app/dashboard/DashboardClient.tsx` (imports)

**Step 1: Create `src/components/LocaleSwitch.tsx`**

```tsx
"use client";
import { useI18n } from "@/lib/i18n/provider";

export function LocaleSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-medium">
      {(["fr", "en"] as Locale[]).map((l) => (
        <button key={l} onClick={() => setLocale(l)} className={`px-2.5 py-1 rounded-md transition ${locale === l ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

**Step 2: Update provider.tsx to remove LocaleSwitch export**

Keep only `I18nProvider` and `useI18n` exports in `src/lib/i18n/provider.tsx`.

**Step 3: Update imports in pages**

- `src/app/page.tsx`: `import { LocaleSwitch } from "@/components/LocaleSwitch";`
- `src/app/dashboard/DashboardClient.tsx`: `import { LocaleSwitch } from "@/components/LocaleSwitch";`

**Step 4: Run lint**

Run: `npm run lint`
Expected: PASS

---

## Phase 2 — Compléter l'i18n (textes hardcoded → traductions)

### Task 2.1: Ajouter les clés de traduction manquantes

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

**Step 1: Add missing keys to fr.json and en.json**

Ajouter les clés manquantes pour :
- Dashboard tab components (labels, placeholders, messages)
- Onboarding page
- Public profile page
- Landing page (déjà partiellement fait)
- Auth pages (déjà partiellement fait)

**Step 2: Verify all keys are present**

Vérifier que chaque texte hardcoded a une clé de traduction对应的.

---

### Task 2.2: Appliquer les traductions dans les composants extraits

**Files:**
- Modify: `src/components/dashboard/TabOverview.tsx`
- Modify: `src/components/dashboard/TabServices.tsx`
- Modify: `src/components/dashboard/TabPortfolio.tsx`
- Modify: `src/components/dashboard/TabSocials.tsx`
- Modify: `src/components/dashboard/TabSettings.tsx`
- Modify: `src/app/onboarding/page.tsx`
- Modify: `src/app/[username]/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/demo/page.tsx`

**Step 1: Add useI18n hook to each component that needs translations**

Replace hardcoded FR strings with `t("key")` calls.

Example in TabServices.tsx:
```tsx
"use client";
import { useI18n } from "@/lib/i18n/provider";
import { addService, deleteService } from "@/app/dashboard/actions";

// ... (rest of component)

export function TabServices({ services }: TabServicesProps) {
  const { t } = useI18n();
  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold font-display text-sm text-gray-900">
        {t("dashboard.servicesTitle")} ({services.length}/8)
      </h2>
      {services.length >= 8 ? (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t("dashboard.servicesFull")}
        </p>
      ) : (
        <form action={addService} className="mt-3 flex flex-col gap-2">
          <input name="title" required placeholder={t("dashboard.servicePlaceholder")} maxLength={60} className="..." />
          {/* ... */}
          <button className="...">{t("dashboard.add")}</button>
        </form>
      )}
      {/* ... */}
    </div>
  );
}
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

---

## Phase 3 — Configuration Next.js

### Task 3.1: Configurer next.config.ts

**Files:**
- Modify: `next.config.ts`

**Step 1: Update next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

---

## Phase 4 — Validation username temps réel

### Task 4.1: Créer l'API route de validation

**Files:**
- Create: `src/app/api/check-username/route.ts`

**Step 1: Create the API route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || !/^[a-z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("is_username_available", { uname: username });

  return NextResponse.json({ available: data ?? false });
}
```

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

---

### Task 4.2: Ajouter la validation client-side dans l'onboarding

**Files:**
- Modify: `src/app/onboarding/page.tsx`

**Step 1: Add real-time username validation**

Add a client-side component or inline validation that calls `/api/check-username` as the user types, showing availability status.

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

---

## Phase 5 — Drag & Drop services/portfolio

### Task 5.1: Implémenter le réordonnancement des services

**Files:**
- Create: `src/components/dashboard/ServiceList.tsx`
- Modify: `src/app/dashboard/actions.ts` (add reorder action)
- Modify: `src/components/dashboard/TabServices.tsx` (use ServiceList)

**Step 1: Add reorder server action**

```ts
export async function reorderServices(orderedIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates = orderedIds.map((id, index) =>
    supabase.from("services").update({ position: index }).eq("id", id).eq("profile_id", user.id)
  );

  await Promise.all(updates);
  revalidatePath("/dashboard");
}
```

**Step 2: Create ServiceList component with drag & drop**

Use native HTML5 drag & drop (no library needed for MVP) or a simple up/down arrow approach.

**Step 3: Apply same pattern to portfolio items**

**Step 4: Run lint**

Run: `npm run lint`
Expected: PASS

---

## Phase 6 — Tests

### Task 6.1: Installer Vitest

**Files:**
- Modify: `package.json` (add vitest dependency)
- Create: `vitest.config.ts`

**Step 1: Install vitest**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
```

**Step 3: Create test setup file**

Create `test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

**Step 4: Add test script to package.json**

```json
"test": "vitest",
"test:run": "vitest run"
```

---

### Task 6.2: Écrire les tests pour les utilitaires

**Files:**
- Create: `src/lib/__tests__/utils.test.ts`

**Step 1: Write tests for utils.ts**

```ts
import { describe, it, expect } from "vitest";
import { cn, normalizePhoneE164, buildWaLink, buildMainWaMessage, buildServiceWaMessage } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("normalizePhoneE164", () => {
  it("adds + prefix", () => {
    expect(normalizePhoneE164("2250700000000")).toBe("+2250700000000");
  });

  it("converts 00 prefix", () => {
    expect(normalizePhoneE164("002250700000000")).toBe("+2250700000000");
  });

  it("keeps existing +", () => {
    expect(normalizePhoneE164("+2250700000000")).toBe("+2250700000000");
  });

  it("removes spaces and dashes", () => {
    expect(normalizePhoneE164("+225 07 00 00 00 00")).toBe("+2250700000000");
  });
});

describe("buildWaLink", () => {
  it("builds correct WhatsApp link", () => {
    const link = buildWaLink("+2250700000000", "Hello");
    expect(link).toBe("https://wa.me/2250700000000?text=Hello");
  });

  it("encodes message", () => {
    const link = buildWaLink("+2250700000000", "Salut, je suis intéressé");
    expect(link).toContain("text=Salut%2C%20je%20suis");
  });
});

describe("buildMainWaMessage", () => {
  it("includes display name", () => {
    const msg = buildMainWaMessage("Aminata");
    expect(msg).toContain("Aminata");
  });
});

describe("buildServiceWaMessage", () => {
  it("includes service title", () => {
    const msg = buildServiceWaMessage("Shooting photo");
    expect(msg).toContain("Shooting photo");
  });

  it("includes price when provided", () => {
    const msg = buildServiceWaMessage("Shooting photo", 50000, "XOF");
    expect(msg).toContain("50 000 XOF");
  });

  it("omits price when null", () => {
    const msg = buildServiceWaMessage("Shooting photo", null);
    expect(msg).not.toContain("XOF");
  });
});
```

**Step 2: Run tests**

Run: `npm run test:run`
Expected: ALL PASS

---

### Task 6.3: Écrire les tests pour les composants auth

**Files:**
- Create: `src/components/auth/__tests__/Alert.test.tsx`

**Step 1: Write tests for Alert component**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert } from "../Alert";

describe("Alert", () => {
  it("renders error alert", () => {
    render(<Alert type="error">Error message</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Error message");
  });

  it("renders success alert", () => {
    render(<Alert type="success">Success message</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Success message");
  });

  it("returns null when no children", () => {
    const { container } = render(<Alert></Alert>);
    expect(container.firstChild).toBeNull();
  });
});
```

**Step 2: Run tests**

Run: `npm run test:run`
Expected: ALL PASS

---

### Task 6.4: Ajouter le script de test au CI

**Files:**
- Modify: `package.json`

**Step 1: Add test:ci script**

```json
"test:ci": "vitest run"
```

**Step 2: Verify full test suite**

Run: `npm run test:run`
Expected: ALL PASS

---

## Récapitulatif des livrables

| Phase | Tâche | Résultat |
|---|---|---|
| 1 | Extraction composants | `src/components/` populate avec auth/, dashboard/, QrShare, Upload, LocaleSwitch |
| 2 | i18n complet | Tous les textes FR hardcoded remplacés par `t()` calls |
| 3 | Config Next.js | Images remote Supabase configurées |
| 4 | Validation username | API route + validation client-side temps réel |
| 5 | Drag & drop | Réordonnancement services/portfolio avec sauvegarde |
| 6 | Tests | Vitest + tests unitaires utils + composants |

**Ordre d'exécution:** Phase 1 → 2 → 3 → 4 → 5 → 6 (chaque phase dépend de la précédente)
