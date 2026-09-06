# Design — Système de 6 templates (refonte complète)

> **Date** : 6 septembre 2026
> **Branche** : `master` (repo `C:\Users\PC\Documents\Bizko`)
> **Sujet** : Reconstruire le système de templates : passer de 2 (flag binaire `minimal`/`portfolio` dans la page publique) à 6 templates à identités distinctes — 2 gratuits + 4 Pro — avec registry, layouts propres, picker visuel et gating par plan.

## Contexte / problème résolu
- Aujourd'hui le profil public (`src/app/[username]/page.tsx`) est un **monolithe** : un flag `const isPortfolio = profile.template === "portfolio"` alterne deux variantes de la même structure. Impossible d'ajouter des templates à vraie identité.
- `plans.ts` promet déjà « 2 templates free / 6 pro » à la page tarifs (`rowTemplates`) : le déficit Free→Pro ne peut pas être honoré aujourd'hui.
- Objectif : une **architecture à registre** où chaque template est un composant autonome avec son layout, ses tokens (typos/palette/radius/rythme), et un **gating** clair par plan.

## Décisions validées (brainstorming)
- **Niveau de refonte** : refonte complète, layouts distincts par template (pas juste des thèmes CSS). Chaque template = composant qui choisit son header, son rythme de sections, ses grilles.
- **2 gratuits** : Minimal, Portfolio (les actuels, reconstruits).
- **4 Pro** : Studio, Édito, Urban, Obsidienne.
- **CTA WhatsApp sticky/flottant** : partagé et injecté par le framework, jamais dupliqué dans un template (règle de conversion non négociable).
- **Picker visuel** : remplace le `<select>` de `TabSettings` par une grille de cartes avec preview + lock Pro + CTA upgrade.
- **Gating** : `canUseTemplate(plan, templateId)` basé sur `tier` du template. Free = `tier === "free"`.

## Registre `src/lib/templates.ts`
Une entrée par template :
```ts
interface TemplateDefinition {
  id: Template;            // 'minimal' | 'portfolio' | 'studio' | 'edito' | 'urban' | 'obsidienne'
  tier: 'free' | 'pro';
  nameKey: string;         // clé i18n ex. "dashboard.templateStudio"
  Component: React.ComponentType<TemplateProps>;
}

export const TEMPLATES: TemplateDefinition[];   // ordre d'affichage du picker
export function getTemplate(id: string | null | undefined): TemplateDefinition; // fallback minimal
export function canUseTemplate(plan: Plan, id: string): boolean;
```
- **Ordre du picker** : minimal, portfolio (free) puis studio, edito, urban, obsidienne (pro).

## Props partagées d'un template (`TemplateProps`)
Chaque composant template reçoit :
- `profile`, `services`, `portfolio`, `socials`, `testimonials` (types existants)
- `msg` (messages public du namespace `profile`)
- `trackClick(type, to)` (helper vers `/api/track-click`)
- `links` calculés : `mainWaRaw`, `telLink`
- `locale` (formatage dates/prix)

Le template rend **ses propres** : header, services, portfolio, socials, témoignages (style). Il ne rend **pas** : CTA sticky/flottant, ViewTracker/ServiceViewTracker, TestimonialForm, lightbox portfolio, footer « Fait avec Bizko » — tout ça est injecté par le framework partagé autour du composant.

## Framic framework partagé
`src/components/ProfileRenderer.tsx` (ou directement dans la page) :
1. Résout `getTemplate(profile.template)`.
2. Rendu `layout` minimal.
3. Rend `<Template {...props} />`.
4. Injecte après le contenu : `ServiceViewTracker` (si services), `TestimonialForm` (si testimonials), CTA sticky mobile + `WhatsAppFloating` desktop, footer, `ViewTracker`.

`[username]/page.tsx` devient un **dispatcher** : fetch data → résolution template → rendu partagé. La metadata et le `notFound()` restent inchangés.

## Les 6 templates — identité & tokens

| id | Nom FR/EN | Tier | Typo | Palette | Signature de layout |
| --- | --- | --- | --- | --- | --- |
| `minimal` | Minimal / Minimal | free | Inter | blanc, slate, accent orange `#FF6B35` | header centré compact, tagline accent, bio en encart, services en liste, grid 3-col léger |
| `portfolio` | Portfolio / Portfolio | free | Inter | blanc, slate, accent orange | header en carte centrée shadow, portfolio dominant 3-col, services borderless dans une carte |
| `studio` | Studio / Studio | pro | Archivo Narrow (condensée) + Inter | noir `#0A0A0A` / blanc, accents monochromes | hero plein écran nom géant uppercase, services en cartes bordées, grid 2:3 |
| `edito` | Édito / Serif | pro | EB Garamond (serif) + Inter | crème `#FAF7F2`, encre `#1C1917`, or `#B07D3D` | nom serif, bio en pull-quote, services façon menu avec pointillés → prix |
| `urban` | Urban / Urban | pro | Sora (display) + Inter | blanc cassé, violet `#7C3AED` | avatar à dégradé, pills/pillules colorées, grille portfolio dynamique |
| `obsidienne` | Obsidienne / Onyx | pro | Inter + condensée | noir `#0B0B0F`, gris froids, or `#D4AF37` | hero sombre, cartes sombres, prix or, portfolio en mosaïque asymétrique |

- **CTA WhatsApp** : vert `#25D366` partout (reconnaissance) ; **accent** = couleur secondaire (tagline, prix, bouton détail service).
- **Portfolio** : lightbox/vidéo = composant partagé (`PortfolioGallery`), seul le *grid container* diffère.
- **Fonts** : via `next/font` variables dans le template concerné ; pas de réseau de fonts Google au runtime côté profil (perf 3G). Nouvelles fonts : Archivo Narrow, EB Garamond, Sora (ajouter en devDeps/deps seulement si auto-persisted par next/font).

## Changements techniques

### DB — `supabase/migrations/20250906000000_templates.sql`
Le CHECK actuel de `20250826000001_initial.sql:29` est une contrainte inline nommée par défaut `profiles_template_check` :
```sql
alter table public.profiles drop constraint if exists profiles_template_check;
alter table public.profiles
  add constraint profiles_template_check check (template in ('minimal','portfolio','studio','edito','urban','obsidienne'));
```
Vérifier le nom exact de contrainte avant exécution. Aucune data migration (ids existants inchangés).

### Types — `src/types/database.ts`
```ts
export type Template = 'minimal' | 'portfolio' | 'studio' | 'edito' | 'urban' | 'obsidienne';
```

### i18n — `messages/{fr,en}.json`
Ajouts namespace `dashboard` : `templateMinimal` (existant), `templatePortfolio` (existant), `templateStudio`, `templateEdito`, `templateUrban`, `templateObsidienne`, `templateLocked` (« Pro »/badge), et courtes descriptions des templates pour le picker (1 ligne chacun, namespace `dashboard.templateDesc.*`, FR + EN).

### Picker — `src/components/dashboard/TabSettings.tsx`
Remplacer le `CustomSelect` par une **grille de cartes** (`TemplatePicker.tsx`) :
- 6 cartes : avatar/initiale miniature + nom + (lock si pro).
- Sélection = ring accent ; template actuel présélectionné.
- Clic sur template pro en plan free → badge lock + bouton « Passer à Pro » (réutilise la logique d'upgrade existante du dashboard / `upgradeTitle` `upgradeCta`).
- Champ `template` envoyé via `updateProfile` existant (action inchangée).

### Gating — `src/lib/plans.ts`
- Pas de changement à `LIMITS` (le compte 2/6 reste la source pour la page tarifs).
- `canUseTemplate` habite `templates.ts` (a besoin du `tier`, pas de `LIMITS`).

### Explore — `src/app/explore`
- `explore_search_rpc` retourne déjà `template` en text : aucun changement. L'affichage carte ignore le template pour l'instant.

## Tests
- `src/lib/__tests__/templates.test.ts` (nouveau) : 6 ids uniques, 2 `free` + 4 `pro`, chaque entrée a un component, `getTemplate(null|'inconnu')` → fallback `minimal`, `canUseTemplate('free', 'studio') === false`, `canUseTemplate('pro', 'studio') === true`.
- **Smoke render par template** : pour chaque id, render le composant avec un jeu de données factice (services, portfolio, socials, testimonials) → pas de crash, sections clés présentes.
- `src/lib/__tests__/plans.test.ts` : inchangé (le compte 2/6 ne bouge pas).
- Vérifications : `npm run build`, `npm run lint`, `npm run test:run`.

## Cas limites / erreurs
- `profile.template` absent/`null`/valeur inconnue (profil existant mal formaté) → `getTemplate` fallback `minimal`, jamais de crash SSR.
- Utilisateur free avec template pro (downgrade abonnement plus tard) → servi en lecture publique ? Le profil reste visible avec son template (décision : ne pas casser les profils existants) ; le gating s'applique au **picker** uniquement. Le downgrade/forcement sera traité par le feature de downgrade Whop (hors scope).
- Fonts lentes / indisponibles → `next/font` auto-héberge et exporte en `font-display: swap` : pas de blocage.

## Hors scope
- Branding removal (« Fait avec Bizko ») — feature Pro séparée.
- Couleur d'accent personnalisable — feature Pro séparée.
- Templates > 6, éditeur drag & drop de layout.