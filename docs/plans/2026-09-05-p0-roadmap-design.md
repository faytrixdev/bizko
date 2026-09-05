# Design — Roadmap P0 : /explore, Témoignages, Digest hebdo

Date : 2026-09-05
Statut : validé (brainstorming, 3 sections approuvées)
Valeur : P0 de `docs/2026-09-03-strategic-analysis.md`

Trois features indépendantes, livrées dans cet ordre :
1. Annuaire public `/explore`
2. Témoignages sur les profils publics
3. Digest email hebdomadaire

Conventions : TDD fer (libs pures testées avant la prod), clés i18n fr/en sans
accents (ASCII), pas de commentaires superflus, migrations SQL appliquées via
Supabase SQL Editor (pas d'harness SQL au repo — vérification manuelle des RPC).

---

## Feature 1 — `/explore` (annuaire public)

### Objectif
Page publique qui liste les profils `is_public = true` avec recherche (texte),
filtres ville + catégorie, badge Pro et tri Pro en tête. Accessible sans login.
URLs partageables et SEO-friendly.

### Architecture
- Page server component `src/app/explore/page.tsx`, rendue depuis les
  `searchParams` (`?q=&ville=&cat=&page=`). Next 16 : `searchParams` est une
  `Promise`, à `await` comme `params`.
- Fonction SQL `public.search_public_profiles(p_query, p_city, p_category,
  p_limit, p_offset)` **SECURITY DEFINER** (pattern `record_event`) :

```sql
returns table(
  id uuid, username text, display_name text, tagline text, avatar_url text,
  city text, country text, category text, template text, is_pro boolean,
  total bigint
)
```

- Recherche ILIKE sur `username`, `display_name`, `city`, `category`, `bio`.
- Filtres exacts `city`, `category`.
- Tri : `is_pro desc, display_name asc`.
- Pagination `limit`/`offset` + `count(*) over()` pour le total.
- WHERE `is_public = true` impératif (définir bypass RLS en `pg_catalog,public`
  via `search_path`).
- Grants : `revoke all` puis `grant execute` à `anon` + `authenticated`.

### Navigation
- Formulaire filtres natif `method="GET"` (aucun JS requis).
- Pagination par liens `?page=N`, `limit = 24`.
- `searchParams` invalides ignorés (page<1 → 1, ville/cat inconnus → ignorés).

### Réservation du slug
Ajouter `"explore"` à :
- `RESERVED_USERNAMES` (`src/lib/reservedUsernames.ts`)
- `reservedRootPrefixes` (`src/lib/supabase/middleware.ts`)

### Catégories
- `src/lib/categories.ts` : `CATEGORIES` = slugs
  `photo, design, video, makeup, dev, community, consult, coach, music, autre`.
- Labels i18n localisés : `messages/*.json → categories.<slug>`.
- Sélecteur dans l'éditeur de profil (dashboard, `TabSettings` + action
  `updateProfile`) → colonne existante `profiles.category` (nullable, inchangée).
- Filtre /explore = liste des slugs ; carte = chip localisé.

### Composants
- `src/components/explore/ExploreCard.tsx` : avatar, nom, tagline, ville/pays,
  chip catégorie, badge Pro. Lien vers `/username`.
- `src/components/explore/ExploreFilters.tsx` (client) : formulaire GET, état des
  valeurs depuis le contexte de page.
- `generateMetadata` (titre + description), lien `/explore` dans la navbar
  landing, entrée dans `sitemap.ts`.

### Erreurs / edge cases
- État vide : message traduit + lien « revoir les filtres ».
- Profil sans catégorie (null) : pas de chip, pas d'erreur.

### Tests
- `src/lib/__tests__/categories.test.ts` : slugs uniques, chaque slug présent
  dans `fr.json` et `en.json`.
- `src/components/explore/__tests__/ExploreCard.test.tsx` : badge Pro rendu si
  `is_pro`, absent sinon ; catégorie manquante sans crash.
- RPC SQL : vérification manuelle (requête + grants) après application.

---

## Feature 2 — Témoignages

### Objectif
Section témoignages sur le profil public. Deux canaux d'entrée : saisie manuelle
par le propriétaire (publié direct) et soumission visiteur (pending →
approbation). Free = 2 publiés, Pro = illimité.

### Table (migration `20250905000002_testimonials.sql`)

```sql
testimonials
  id            uuid PK
  profile_id    uuid not null references profiles(id) on delete cascade
  author_name   text not null
  author_role   text                 -- nullable, ex. "CEO, Studio D"
  content       text not null check (char_length(content) <= 400)
  rating        smallint check (rating between 1 and 5)  -- nullable, étoiles
  is_published  bool not null default true
  created_at    timestamptz not null default now()
  index (profile_id, is_published)
```

### RLS
- Lecture publique : `is_published = true`.
- Owner : full CRUD sur `profile_id = auth.uid()`.
- Insertion visiteur (anon/non-owner) : policy qui **force**
  `NEW.is_published = false` (impossible d'auto-publier) et
  `NEW.profile_id <> auth.uid()` (l'owner utilise son propre canal).

### Anti-spam soumission visiteur
- Honeypot dans le formulaire.
- Rate-limit par IP (réutilise `src/lib/rateLimit.ts`).

### Dashboard
- Nouvel onglet `temoignages` dans `DashboardClient` → `TabTestimonials.tsx`.
- Listing : publiés + pending avec compteur de modération.
- Server actions (`src/app/dashboard/actions.ts`) :
  - `addTestimonial` (owner, publié direct — limité par quota)
  - `approveTestimonial` (pending → publié — limité par quota)
  - `deleteTestimonial`
- Quota : `PlanLimits.maxPublishedTestimonials` (free 2 / pro ∞) ajouté à
  `src/lib/plans.ts` (`LIMITS` + `PLAN_COMPARISON` + messages `pricing.*`).
  Vérification via `supabase.rpc("is_pro")` (pattern `canAddService`).

### Profil public
- Section dans `src/app/[username]/page.tsx` (serveur), jointe au cache
  `PUBLIC_PROFILES_TAG` (revalidée comme les services/portfolio).
- `TestimonialCard` : initiale avatar, nom, rôle, étoiles (dorées), texte.
- Ordre : `created_at desc`.

### Erreurs / edge cases
- Quota free atteint → message traduit + CTA Pro (bannière existante).
- Soumission visiteur → feedback « merci, en attente de validation ».
- Aucun témoignage publié → section cachée.

### Tests
- `src/lib/__tests__/plans.test.ts` : limites `maxPublishedTestimonials`
  (free=2, pro=∞).
- `src/lib/__tests__/testimonials.test.ts` : helpers de validation
  (contenu ≤ 400, rating 1-5) si extraits en lib pure.
- `src/components/dashboard/__tests__/TestimonialCard.test.tsx` : rendu étoiles
  présent/absent.
- RLS + quota : vérification manuelle après application de la migration.

---

## Feature 3 — Digest hebdo

### Objectif
Email hebdomadaire (lundi) aux profils actifs : stats 7 jours (vues, clics
WhatsApp, service le plus visité) + variations vs semaine précédente + une
suggestion automatique + CTA Pro pour les free. Désinscription par lien signé.

### Infra
- Dépendance `resend` ; env `RESEND_API_KEY` (`.env.example` + Vercel prod).
- Cron Vercel `vercel.json` :
  `{ "path": "/api/cron/digest", "schedule": "0 7 * * 1" }`.
- Route `src/app/api/cron/digest/route.ts` (GET) protégée par
  `x-cron-secret` === `CRON_SECRET`.
- Env additionnelles : `CRON_SECRET`, `DIGEST_SECRET` (signature des liens).

### Tables
```sql
digest_prefs(profile_id uuid PK, unsubscribed_at timestamptz)
digest_sends(profile_id uuid, week text, sent_at timestamptz, email text,
             PK(profile_id, week))   -- idempotence anti-retry
```

### Pipeline du cron
1. Vérifier `CRON_SECRET`.
2. Admin client (service-role) : profils `is_public=true`,
   `not in digest_prefs (unsubscribed)`, `not in digest_sends (week courante)`.
3. Email map via `auth.admin.listUsers` (paginer).
4. Par profil : RPC `get_profile_weekly_digest(profile_id)` → JSON
   `{ views, clicks, prev_views, prev_clicks, top_service_name,
     top_service_count, has_activity }`.
   `has_activity=false` → skip (pas d'email « zéro stat »).
5. Construire + envoyer via Resend ; catch par utilisateur (échec d'un email ne
   bloque pas les autres) ; log des échecs.
6. Insérer `digest_sends` après succès.

### RPC SQL `get_profile_weekly_digest` (SECURITY DEFINER)
Agrégats 7 derniers jours vs 7 précédents (pattern `get_daily_events`),
service le plus visité par `service_id` sur les events de vues.

### Logique (libs pures, `src/lib/digest/`)
- `suggestion.ts` : première règle non satisfaite → bio absente, <3 services,
  pas de portfolio, sinon CTA Pro générique.
- `renderEmail.ts` : HTML (stats en cartes, variations %, service top,
  suggestion, bouton « Passer Pro » → `/pricing` pour les free, footer avec lien
  de désinscription + « Envoyé avec Bizko ») + sujet, depuis
  `getMessages(locale)` — namespace `digest` fr/en.
- Locale par `profile.locale`.

### Désinscription
- Lien signé : `https://<domaine>/api/digest/unsubscribe?profile=<id>&sig=<hmac(id+DIGEST_SECRET)>`.
- `src/app/api/digest/unsubscribe/route.ts` : vérifie la signature (401 sinon),
  refuse si `profile` inconnu (404), idempotent ; définit
  `digest_prefs.unsubscribed_at` via admin client.
- Page de confirmation `src/app/digest/unsubscribed/page.tsx`.

### Erreurs / edge cases
- Aucun candidat → 200 no-op.
- Paiement Resend échoue → log, on continue, pas de `digest_sends`.
- `RESEND_API_KEY` absente → 500 explicite (cron, prod uniquement).
- Signature invalide → 401 ; profil inexistant → 404.
- Retry du cron → bloqué par `digest_sends`.

### Tests
- `src/lib/__tests__/digest.test.ts` :
  - `suggestion.ts` : chaque règle dans l'ordre, cas « tout ok → CTA Pro ».
  - `renderEmail.ts` : HTML contient les chiffres, le lien unsub signé,
    le CTA présent/absent selon `is_pro`.
  - `week.ts` (helper de période courante) : frontières semaine.
- Route : vérification manuelle (cron en prod).

---

## Contraintes transverses
- Lire les docs Next 16 pertinentes dans `node_modules/next/dist/docs/` avant
  d'écrire du code (route handlers, server components, data fetching,
  caching/revalidation) — exigence du bloc `AGENTS.md`.
- Loi TDD fer : `src/lib/*` logiciels purs testés d'abord ; composants
  critiques testés (jsdom déjà configuré).
- i18n : toute chaîne visible dans `messages/fr.json` **et** `messages/en.json`
  (clés ASCII sans accents).
- Env secrets jamais commités ; `.env.example` mis à jour.
- Migrations : appliquer sur la base réelle via le SQL Editor Supabase, vérifier
  les grants + un smoke test RPC après coup.