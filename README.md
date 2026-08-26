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

## Principes
Mobile-first, ultra-léger (<1.5s 3G), CTA WhatsApp sticky, 2 templates skins même structure, gratuit au MVP, FR/EN, online only.
