# 06 — Database Bizko

Supabase Postgres, RLS activée. Uniquement tables MVP. Pas de table pour features NOT NOW.

## Schéma

### auth.users (Supabase natif)
Géré par Supabase Auth. `id` uuid PK.

### profiles
1 user = 1 profile (1:1).

| colonne | type | contraintes |
|---|---|---|
| id | uuid PK FK → auth.users.id | on delete cascade |
| username | text unique | 3-30, a-z0-9_, lower, not null, unique index |
| display_name | text | not null |
| tagline | text | not null |
| bio | text | max 280, nullable |
| avatar_url | text | nullable (storage path) |
| city | text | not null |
| country | text | not null (ex: CI, SN, NG) |
| phone_e164 | text | not null, format +225..., unique optionnel |
| email_public | text | nullable |
| template | text | enum: 'minimal','portfolio' (défaut minimal) |
| locale | text | enum: 'fr','en' défaut fr |
| is_public | boolean | défaut true (prépare annuaire V2) |
| category | text | nullable (prépare annuaire, ex: photo, coaching) |
| created_at | timestamptz | défaut now() |
| updated_at | timestamptz | trigger |

Indexes : `unique(username)`, `index(city)`, `index(category)` pour futur.

### services
```
profiles 1 → N services
```

| colonne | type | contraintes |
|---|---|---|
| id | uuid PK | défaut gen_random_uuid() |
| profile_id | uuid FK → profiles.id | not null, on delete cascade |
| title | text | not null, max 60 |
| description | text | nullable, max 140 |
| price | integer | nullable (>=0, en plus petite unité) |
| currency | text | enum XOF/EUR/USD défaut XOF |
| position | integer | not null, défaut 0 |

Index : `index(profile_id, position)`. Contrainte : max 8 par profile (check via RLS/function ou app).

### portfolio_items
```
profiles 1 → N portfolio_items
```

| colonne | type | contraintes |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id | on delete cascade |
| image_url | text | not null (storage path) |
| title | text | nullable |
| position | integer | not null |

Index : `index(profile_id, position)`. Max 9.

### social_links
```
profiles 1 → N social_links
```

| colonne | type | contraintes |
|---|---|---|
| id | uuid PK | |
| profile_id | uuid FK → profiles.id | on delete cascade |
| platform | text | enum: instagram,tiktok,linkedin,facebook,x,youtube,behance,website |
| url | text | not null, check URL |
| position | integer | not null |

Index : `index(profile_id, position)`. Max 6.

### events (SHOULD HAVE, optionnel MVP)
Pour analytics basiques.

| colonne | type |
|---|---|
| id | uuid PK |
| profile_id | uuid FK → profiles.id |
| type | text enum: view, click_whatsapp_main, click_whatsapp_service, click_tel |
| service_id | uuid nullable FK → services.id |
| created_at | timestamptz |

Index : `index(profile_id, type, created_at)`.

## Relations
```
auth.users 1 — 1 profiles
profiles 1 — N services
profiles 1 — N portfolio_items
profiles 1 — N social_links
profiles 1 — N events
services 1 — N events (via service_id)
```

## Règles de sécurité (RLS)

Activer RLS sur toutes les tables.

- **profiles** :
  - SELECT : public peut lire où `is_public = true` (profil public). Owner peut lire son propre profil même si non public.
  - INSERT/UPDATE/DELETE : uniquement si `auth.uid() = id`.
  - username unique enforce DB.

- **services / portfolio_items / social_links / events** :
  - SELECT : public peut lire si `profile.is_public = true` (via join ou vue). Simplification MVP : SELECT public autorisé, filtrage via `profile_id` public, car pas de données sensibles.
  - INSERT/UPDATE/DELETE : uniquement si `auth.uid() = (select id from profiles where id = profile_id)`.

Alternative MVP simple : RLS `enable` + policies owner-only pour write, `allow select for all` pour read public (car données publiques par nature). Pas de données privées sauf `auth.users`.

## Données publiques vs privées
- Publiques : tout dans profiles/services/portfolio/social_links (sauf si is_public false futur).
- Privées : `auth.users.email`, `auth.users` metadata, `events` (stats privées owner).

## Contraintes
- username : `CHECK (username ~ '^[a-z0-9_]{3,30}$')`
- phone_e164 : `CHECK (phone_e164 ~ '^\+\d{8,15}$')`
- price >=0
- Pas de table pour : domaines, paiements, équipes, produits physiques.

## Migrations
- Trigger `updated_at` sur profiles.
- Fonction `is_username_available(text)` pour check temps réel.

## DÉCISION NÉCESSAIRE
- Faut-il une table `testimonials` pour SHOULD HAVE ou réutiliser une table générique ? Recommandation : table dédiée `testimonials` si feature activée, sinon ne pas créer.
