# Design — Page tarifs `/pricing` (comparatif Free vs Pro)

> **Date** : 4 septembre 2026
> **Branche** : `master` (repo `C:\Users\PC\Documents\Bizko`)
> **Sujet** : Nouvelle page publique `/pricing` avec tableau comparatif Free vs Pro et cartes de prix, pour montrer la valeur de Bizko Pro aux visiteurs et convertir au checkout.

## Contexte / problème résolu
- Aujourd'hui l'upgrade est une petite card du dashboard : « Passe a Bizko Pro / Plus de services, de videos et de portfolio. » Le visiteur ne voit **aucune comparaison chiffrée** : impossible de savoir pourquoi passer Pro.
- Objectif : une page publique dédiée qui présente les **différences réelles** (issues de `plans.ts`) et propose un CTA **adapté à l'état de l'utilisateur**.

## Décisions validées
- **Emplacement** : nouvelle route publique `src/app/pricing/page.tsx` (+ `PricingClient` + `PricingTable`).
- **Contenu** : tableau comparatif **2 colonnes** (Free / Pro) montrant **uniquement les différences** (7 lignes). Pastille « Populaire » sur la colonne Pro, surlignée en violet.
- **Source unique des chiffres** : `plans.ts` (LIMITS + `videoDurationLimitSec` / `videoSizeLimitBytes`). Nouvel export `PLAN_COMPARISON` dérivé, jamais de chiffres en dur côté UI.
- **CTA adaptatifs (côté serveur)** :
  - Visiteur non connecté → « Créer mon compte » → `/signup?next=/pricing`.
  - Connecté Free → deux boutons `startSubscription` (Mensuel / Annuel) → checkout Whop direct.
  - Connecté Pro → « Gérer mon abonnement » → `/dashboard/subscription`.
- **`next` après signup** : le callback OAuth honore déjà `?next=` sécurisé (même origine) pour les profils existants (`auth/callback/route.ts:46`). Les inscrits par email suivent le flux vérification → onboarding → dashboard (card d'upgrade présente). Aucune modification du flux auth.
- **Pas d'appel Whop au rendu de la page** : lecture `subscriptions` uniquement si user connecté.

## Lignes du tableau (`PLAN_COMPARISON`)
| Clé i18n | Free | Pro |
| --- | --- | --- |
| `services` | 8 | 15 |
| `socials` | 6 | 15 |
| `portfolio` | 9 | 30 |
| `videos` | 3 | Illimité |
| `videoDuration` | 3 min | 5 min |
| `videoSize` | 200 MB | 500 MB |
| `templates` | 2 | 6 |

- Formatage des valeurs (minutes, MB, « Illimité ») produit par `PLAN_COMPARISON` (fonction pure, sans env ni fetch).
- Libellés i18n dans `messages/{fr,en}.json`, namespace `pricing`.

## Structure de la page
1. **En-tête** : `LandingNavbar` réutilisée (+ lien « Tarifs » ajouté aux items desktop/mobile).
2. **Hero** : titre + sous-titre courts + CTA principal (même logique adaptative).
3. **Tableau comparatif** : `PricingTable` — 3 colonnes visuelles : libellé / Free (gris) / Pro (violet, pastille « Populaire »).
4. **Cartes de prix** : Mensuel 2 500 FCFA / Annuel 20 000 FCFA, CTA adaptatif.
5. **Pro note** : si connecté Pro, les cartes montrent « Gérer mon abonnement » ; sinon checkout/signup.

## Implémentation (fichiers)
- `src/lib/plans.ts` — ajouter l'export `PLAN_COMPARISON` (dérivé de LIMITS + const vidéo).
- `src/app/pricing/page.tsx` — page serveur : `getUser()` → `subscriptions` → `isPro` → rend `LandingNavbar` + `PricingClient`.
- `src/app/pricing/PricingClient.tsx` — composant client (hero, tableau, cartes, CTA) ;
- `src/app/pricing/PricingTable.tsx` — rend `PLAN_COMPARISON`.
- `src/components/landing/LandingNavbar.tsx` — ajouter le lien « Tarifs » (`#` → `/pricing` sur la page, ou `/pricing`), desktop + mobile.
- `messages/{fr,en}.json` — namespace `pricing` + clé `landing.navPricing`.

## Tests
- Étendre `src/lib/__tests__/plans.test.ts` : `PLAN_COMPARISON` → 7 lignes, clés i18n uniques, valeurs cohérentes avec `LIMITS`, ordre stable, pas de doublons, format vide/longueur.
- Résolution d'état CTA : page serveur non unit-testée (convention du repo) ; la logique simple `isPro` est lue comme sur le dashboard.
- Pas de changement au flux auth.

## Cas limites / erreurs
- `getUser()` échoue (incohérence session) → traité comme visiteur (`isAuthed=false`), la page reste publique.
- Aucune entrée `subscriptions` → free → CTA checkout.
- `startSubscription` échoue côté Whop → redirection `/dashboard?error=checkout_failed` (comportement existant).