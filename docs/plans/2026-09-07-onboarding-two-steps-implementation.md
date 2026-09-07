# Two-Step Onboarding with Template Picker — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the onboarding page into two steps, adding a second step where the user picks their template (reusing the dashboard `TemplatePicker`, Pro templates shown locked).

**Architecture:** Keep a single `<form>` + single server action `completeOnboarding`. Client-side `useState<1 | 2>` toggles which step is visible; the inactive step is hidden with CSS so all field values stay in the DOM and "Back" restores them for free. The server action reads `template` from FormData (replacing the hardcoded `"minimal"`) and rejects Pro templates via `canUseTemplate("free", ...)`.

**Tech Stack:** Next.js App Router (server actions), React `useState`, Tailwind, existing `TemplatePicker` + `template-config`, i18n via `messages/{fr,en}.json`.

**Context:** Design doc at `docs/plans/2026-09-07-onboarding-two-steps-design.md` (committed). Working on `master`. The `TemplatePicker` component requires NO changes — it renders a hidden `<input name="template">`.

---

### Task 1: i18n keys (fr + en)

**Files:**
- Modify: `messages/fr.json:228-250`
- Modify: `messages/en.json:228-250`

**Step 1: Add keys**

In the `"onboarding"` object of `messages/fr.json`, add after `"pricing"` / near the other step keys:

```json
"step1Of": "Étape 1/2",
"step2Of": "Étape 2/2",
"templateChoice": "Ton template",
"continue": "Continuer",
"back": "Retour",
"errorTemplateLocked": "Ce template nécessite l'offre Pro."
```

In `messages/en.json`, same keys:

```json
"step1Of": "Step 1/2",
"step2Of": "Step 2/2",
"templateChoice": "Your template",
"continue": "Continue",
"back": "Back",
"errorTemplateLocked": "This template requires the Pro plan."
```

**Step 2: Verify JSON validity**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('ok')"`
Expected: `ok`

**Step 3: Commit**

```bash
git add messages/fr.json messages/en.json
git commit -m "feat(onboarding): add i18n keys for two-step flow and template lock error"
```

---

### Task 2: Server action reads and validates `template`

**Files:**
- Modify: `src/app/onboarding/actions.ts:5,24-27,47-56`

**Step 1: Read the template from FormData (with fallback)**

Add import after line 8 (`import { trackEvent } ...`):

```ts
import { canUseTemplate } from "@/lib/template-config";
```

After line 26 (`const service_currency = ...`), add:

```ts
const template = (formData.get("template") as string) || "minimal";
```

After the existing required-fields guard (line 37, `if (!display_name || ...) redirect(...)`), add:

```ts
// Pro templates are locked for free users server-side (never trust the client).
if (!canUseTemplate("free", template)) {
  redirect("/onboarding?error=template_locked");
}
```

Replace the hardcoded template at line 54 (`template: "minimal",`) with:

```ts
template,
```

**Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/onboarding/actions.ts
git commit -m "feat(onboarding): read template from form and lock pro templates server-side"
```

---

### Task 3: Two-step UI on the onboarding page

**Files:**
- Modify: `src/app/onboarding/page.tsx`

**Step 1: Rewrite the page**

Replace the entire file with:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useI18n } from "@/lib/i18n/provider";
import { useCleanUrl } from "@/lib/hooks";
import { completeOnboarding } from "./actions";
import { UsernameField } from "@/components/UsernameField";
import { CountrySelect } from "@/components/CountrySelect";
import { CustomSelect } from "@/components/CustomSelect";
import { TemplatePicker } from "@/components/dashboard/TemplatePicker";

const ERROR_KEYS: Record<string, string> = {
  username_invalide: "onboarding.errorUsernameInvalid",
  username_reserve: "onboarding.errorUsernameReserved",
  username_pris: "onboarding.errorUsernameTaken",
  champs_requis: "onboarding.errorRequired",
  template_locked: "onboarding.errorTemplateLocked",
  echec: "onboarding.errorGeneric",
};

function Submit() {
  const { t } = useI18n();
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? t("onboarding.publishing") : t("onboarding.publishBtn")}
    </button>
  );
}

export default function Onboarding() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || undefined;
  const { t } = useI18n();
  useCleanUrl();
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [step, setStep] = useState<1 | 2>(1);

  const errorMsg = error ? t(ERROR_KEYS[error] ?? "onboarding.errorGeneric") : undefined;

  const handleStatusChange = useCallback((status: string) => {
    setUsernameStatus(status);
  }, []);

  const usernameMessage =
    usernameStatus === "available" ? (
      <span className="text-xs text-green-600">{t("username.available")}</span>
    ) : usernameStatus === "unavailable" ? (
      <span className="text-xs text-red-600">{t("username.taken")}</span>
    ) : usernameStatus === "invalid" ? (
      <span className="text-xs text-red-600">{t("username.invalid")}</span>
    ) : (
      <span className="text-xs text-gray-400">{t("username.idle")}</span>
    );

  const advance = (e: React.FormEvent<HTMLFormElement>) => {
    if (step === 1) {
      e.preventDefault();
      if ((e.currentTarget as HTMLFormElement).checkValidity()) setStep(2);
      else (e.currentTarget as HTMLFormElement).reportValidity();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-lg border border-gray-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-6 w-6 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-black">B</span>
          <span className="text-xs font-medium tracking-widest uppercase text-gray-400">{step === 1 ? t("onboarding.step1Of") : t("onboarding.step2Of")}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight font-display text-gray-900">{t("onboarding.title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("onboarding.subtitle")}</p>
        {errorMsg && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{errorMsg}</p>}
        <form action={completeOnboarding} onSubmit={advance} className="mt-6 flex flex-col gap-6">
          <div className={step === 1 ? "" : "hidden"}>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">1</span> {t("onboarding.step1")}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="shrink-0 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg px-3 h-11 inline-flex items-center">bizko.pro/</span>
                <UsernameField onStatusChange={handleStatusChange} />
              </div>
              <div className="mt-1.5">{usernameMessage}</div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">2</span> {t("onboarding.step2")}</p>
              <div className="flex flex-col gap-3 mt-3">
                <input name="display_name" required maxLength={60} placeholder={t("onboarding.namePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <input name="tagline" required maxLength={60} placeholder={t("onboarding.taglinePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <input name="city" required placeholder={t("onboarding.cityPlaceholder")} className="w-full sm:flex-[2] min-w-0 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                  <CountrySelect name="country" defaultValue="BF" required className="flex-1 sm:flex-none sm:w-40" />
                </div>
                <input name="phone_e164" required placeholder={t("onboarding.phonePlaceholder")} type="tel" inputMode="tel" autoComplete="tel" pattern="^\+[0-9]{6,15}$" title={t("onboarding.phoneHint")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900 w-full" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">3</span> {t("onboarding.step3")}</p>
              <div className="flex flex-col gap-3 mt-3">
                <input name="service_title" required maxLength={60} placeholder={t("onboarding.servicePlaceholder")} className="h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                <div className="flex gap-2">
                  <input name="service_price" type="number" placeholder={t("onboarding.pricePlaceholder")} className="flex-1 h-11 rounded-lg border border-gray-200 px-4 text-sm outline-none focus:border-gray-900" />
                  <CustomSelect
                    name="service_currency"
                    defaultValue="XOF"
                    options={[
                      { value: "XOF", label: "XOF" },
                      { value: "XAF", label: "XAF" },
                      { value: "NGN", label: "NGN" },
                      { value: "KES", label: "KES" },
                      { value: "ZAR", label: "ZAR" },
                      { value: "DZD", label: "DZD" },
                      { value: "GHS", label: "GHS" },
                      { value: "TZS", label: "TZS" },
                      { value: "UGX", label: "UGX" },
                      { value: "USD", label: "USD" },
                      { value: "EUR", label: "EUR" },
                      { value: "GBP", label: "GBP" },
                    ]}
                    className="w-28 h-11"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                const form = e.currentTarget.form as HTMLFormElement | null;
                if (form) {
                  if (form.checkValidity()) setStep(2);
                  else form.reportValidity();
                }
              }}
              className="h-11 rounded-lg bg-accent text-white font-semibold hover:bg-accent-hover transition-colors"
            >
              {t("onboarding.continue")}
            </button>
          </div>

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm font-semibold flex items-center gap-2 text-gray-900"><span className="h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">4</span> {t("onboarding.templateChoice")}</p>
                <div className="mt-3">
                  <TemplatePicker current="minimal" isPro={false} />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 flex-1 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors"
                >
                  {t("onboarding.back")}
                </button>
                <div className="flex-1">
                  <Submit />
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
```

Note: the `advance` function guards the step-1→step-2 transition via `onSubmit` (covers Enter key), and the "Continue" button uses the same logic directly so the `submit` button on step 2 still submits the server action.

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 3: Lint the modified file**

Run: `npx eslint src/app/onboarding/page.tsx`
Expected: no errors (note: pre-existing repo-level lint issues elsewhere are out of scope).

**Step 4: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat(onboarding): add two-step flow with template picker step"
```

---

### Task 4: Global verification and push

**Step 1: Test suite**

Run: `npm run test:run`
Expected: all tests pass (no regression; the onboarding page has no dedicated test suite).

**Step 2: Full typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

**Step 3: Manual sanity check (if app can run)**

Run `npm run dev` and open `/onboarding` with an authenticated session — step 1 → Continue → pick template → Publish. Pro templates show the lock badge + `/pricing` CTA; submitting a Pro template redirects back with the locked error message.

**Step 4: Push**

```bash
git add docs/plans/2026-09-07-onboarding-two-steps-design.md
git commit -m "docs(onboarding): two-step onboarding implementation plan"
git push origin master
```