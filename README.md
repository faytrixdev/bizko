# Bizko — Ton business en un lien

Plateforme de profil pro pour indépendants africains qui vendent un service. Un lien qui convertit en WhatsApp.

## Stack
Next.js 16 + Tailwind 4 + Supabase (Auth/DB/Storage) + Vercel

## Docs
Voir `docs/`:
- `00-vision.md` — vision & positionnement
- `01-product.md` — produit
- `02-mvp.md` — MVP MUST/SHOULD/NOT NOW
- `03-user-flows.md` — flows
- `04-ui-ux.md` — UI/UX
- `05-tech-stack.md` — stack
- `06-database.md` — DB
- `07-agent-rules.md` — règles agent

## Setup local

1. `npm install`
2. Crée projet Supabase → copie URL + anon/service keys dans `.env.local` (voir `.env.example`)
3. Supabase SQL Editor → run `supabase/migrations/20250826000001_initial.sql` puis `20250826000002_storage.sql`
4. `npm run dev` → http://localhost:3000
5. `npm run build` doit passer

## Routes
- `/` — landing
- `/[username]` — profil public (SSR)
- `/dashboard` — éditeur (à implémenter)
- `/account` — gestion du profil
- `/onboarding` — setup initial du profil

## Auth

Email + password et Google OAuth via Supabase Auth.

**Flows :**
- `/login` — connexion
- `/signup` — inscription (email verify)
- `/forgot-password` — réinitialisation
- `/reset-password` — nouveau mot de passe
- `/verify-email` — confirmation email
- `/auth/callback` — OAuth redirect handler

**Middleware :** protège les routes privées (`/dashboard`, `/account`). Redirige vers `/login` si non connecté, vers `/onboarding` si pas de profil. Les routes `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` sont publiques.

**Account (`/account`) :**
- Modification du profil
- Changement de mot de passe
- Suppression de compte

## Env Variables

```
NEXT_PUBLIC_SUPABASE_URL=         # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Clé publique anon
SUPABASE_SERVICE_ROLE_KEY=        # Clé service role (serveur uniquement)
NEXT_PUBLIC_SITE_URL=             # URL du site (ex: http://localhost:3000)
```

Voir `.env.example` pour le template.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # vérifier que ça passe
```

Pour tester les flows auth en local, configure un projet Supabase avec les providers email et Google activés.

## Principes
Mobile-first, ultra-léger (<1.5s 3G), CTA WhatsApp sticky, 2 templates skins même structure, gratuit au MVP, FR/EN, online only.
