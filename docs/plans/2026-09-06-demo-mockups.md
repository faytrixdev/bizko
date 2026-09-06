# Plan — Page Demo : mockups des 6 templates avec images Unsplash IA

> **Date** : 6 septembre 2026
> **Branche** : `master`
> **Sujet** : Transformer `/demo` en une démo complète des 6 templates (2 free + 4 pro), avec un sélecteur de template et des données factices **dédiées par template**. Remplacer les images du projet (`/mockup/*`) par des **URLs Unsplash** (personnes = portraits/photos, portfolio = visuels).

## Décisions validées (questions utilisateur)
- **Structure** : une seule route `/demo` avec un bandeau de démo (badge `Démo` + sélecteur de template) au-dessus du profil rendu **inline**. Boutons pour switcher entre les 6 templates sans recharger.
- **Images** : URLs `images.unsplash.com` distantes (pas de téléchargement local). Avatars = portraits photo crédibles ; portfolio = visuels par métier.
- **Contenu** : **un persona dédié par template** (nom, tagline, bio, ville, services, portfolio, avis, socials) — cohérent avec la signature de chaque template.

## Approche technique
- Réutiliser les **6 composants template** existants (`src/components/templates/*.tsx`).
- Créer un **`DemoProfileView`** (renderer démo) qui rend `<Template.Component {…props} />` + le footer « Fait avec Bizko », **sans** les trackers/TestimonialForm/WhatsAppFloating (inutiles en démo, et évite les appels Supabase).
- Un **jeu de fixtures** `src/app/demo/fixtures.ts` exportant un `Record<Template, TemplateProps>` avec données 100% factices.
- La page `/demo` est un composant **client** : état `selected` du template, `TemplatePicker` simplifié (réutilise `t()`), rend inline de `DemoProfileView`.

## Config nécessaire (images distantes)
- `next.config.ts` : ajouter `remotePatterns` pour `images.unsplash.com`.
- CSP (headers `img-src`) : ajouter `https://images.unsplash.com`.

---

## Task 1 : Config images distantes (Unsplash)

**Files:**
- Modify: `next.config.ts`
- Modify: `next.config.ts` (CSP header `img-src`)

**Step 1: remotePatterns**
Dans `images.remotePatterns`, ajouter :
```ts
{
  protocol: "https",
  hostname: "images.unsplash.com",
},
```

**Step 2: CSP img-src**
Dans la value `Content-Security-Policy`, chaîne `img-src`, ajouter `https://images.unsplash.com`.

**Step 3: Vérif**
`npx tsc --noEmit` PASS. `npm run dev` ne casse pas au démarrage.

**Step 4: Commit**
```bash
git add next.config.ts
git commit -m "chore(config): allow Unsplash remote images"
```

---

## Task 2 : Fixtures démo — personas par template

**Files:**
- Create: `src/app/demo/fixtures.ts`

Un persona par template, chaque jeu remplit `TemplateProps` complet. Exemples de personas :
- `minimal` : **Awa Diallo** — Photographe à Abidjan (services photo, portfolio, avis).
- `portfolio` : **Mamadou Traoré** — Graphiste à Dakar (portfolio dominant).
- `studio` : **Yann Kouassi** — Photographe studio (noir & blanc).
- `edito` : **Clara Mensah** — Architecte d'intérieur à Accra (serif, luxe).
- `urban` : **Jules Zongo** — Designer urbain à Ouagadougou (violet, énergie).
- `obsidienne` : **Nora Bamba** — Couturière haute gamme (dark, or).

Chaque fixture fournit : `profile` (avec `template`, `avatar_url` Unsplash), `services` (2-3), `portfolio` (2-4 items `media_url` Unsplash), `socials`, `testimonials` (camelCase), `msg` (réutiliser un objet factice complet — voir `src/components/templates/__tests__/fixture.ts`), `links` (wa.me factice), `trackClick`.

Export : `export const DEMO_FIXTURES: Record<Template, TemplateProps>` et `export const DEMO_TEMPLATE_IDS: Template[] = ["minimal","portfolio","studio","edito","urban","obsidienne"]`.

Note : URL Unsplash fiables et stables (format `https://images.unsplash.com/photo-<id>?w=…&q=…&auto=format&fit=crop`). Avatars via crop carré; portfolio via `fit=crop`.

**Step 3: Vérif** — `npx tsc --noEmit` PASS (types stricts).

**Step 4: Commit**
```bash
git add src/app/demo/fixtures.ts
git commit -m "feat(demo): per-template persona fixtures with Unsplash images"
```

---

## Task 3 : DemoProfileView renderer

**Files:**
- Create: `src/app/demo/DemoProfileView.tsx`

Un composant qui rend un template donné avec sa fixture, **sans** trackers/formulaire/flottant. Signature :
```ts
interface DemoProfileViewProps { template: Template; locale: string; }
```
- Résout `getTemplate(template)`.
- Récupère `DEMO_FIXTURES[template]`.
- Rendu :
```tsx
<div className={`min-h-screen ${tpl.bgClass}`}>
  <div className="max-w-[640px] mx-auto px-4 py-8 pb-16 sm:pb-8">
    <tpl.Component {...fixture} />
    <p className={footerClass}>{msg.profile?.madeWith ?? "Fait avec"} …</p>
  </div>
</div>
```
- `msg` provient de la fixture (il est déjà inclus dans `TemplateProps`).
- Pas de TestimonialForm, WhatsAppFloating, ViewTracker, ServiceViewTracker.

**Step 3: Vérif** — `npx tsc --noEmit` PASS.

**Step 4: Commit**
```bash
git add src/app/demo/DemoProfileView.tsx
git commit -m "feat(demo): demo profile renderer (no trackers/supabase)"
```

---

## Task 4 : Bandeau démo + sélecteur (page `/demo`)

**Files:**
- Rewrite: `src/app/demo/page.tsx` (devient un composant client avec état)

Structure :
```tsx
"use client";
const [tpl, setTpl] = useState<Template>("minimal");
```
- Header : logo + bouton « Créer le mien » (`/signup`) (garder).
- Bandeau démo : badge « Démo » + **sélecteur** de template (6 petits boutons pills : nom + dot si pro verrouillé). Utiliser `TEMPLATE_CONFIGS` pour les noms et `t()`.
- Zone de rendu : `<DemoProfileView template={tpl} />`, remonté quand `tpl` change (`key={tpl}` pour forcer le remount).
- Garder la structure mobile (max-w-640) cohérente avec un vrai profil.

**Step 3: Vérif** — `npm run build` PASS (images Unsplash passent la config), `npx tsc --noEmit` PASS. Smoke : `npm run dev`, ouvrir `/demo`, cliquer les 6 templates.

Suggestion sortie générateur : « Vouloir qu'on ajoute un lien direct partageable par template ? (`/demo/minimal`) »

**Step 4: Commit**
```bash
git add src/app/demo/page.tsx
git commit -m "feat(demo): interactive template switcher on /demo"
```

---

## Task 5 : Vérification finale + cleanup

**Files:** none (ou fixups)

- Supprimer les images locales `/public/mockup/*` si plus référencées (vérifier `rg` avant).
- `npm run test:run` (les fixtures n'impactent pas les tests existants).
- `npm run build`, `npx tsc --noEmit`.
- Hand-off : noter qu'il faut re-déployer (la config `remotePatterns` + CSP change).

**Step 3: Commit** fixups éventuels :
```bash
git add -A
git commit -m "chore(demo): final polish"
```

---

## Hors scope
- Images IA générées à chaud (thispersondoesnotexist / API) — instables, on garde Unsplash fixe.
- Téléchargement des images dans le repo.
- Links directes par template (`/demo/minimal`) — suggestion après validation.
