# 05 — Tech Stack Bizko

Principes : simplicité, solo dev, déploiement rapide, coût quasi nul au MVP. Pas d’infra inutile. Online only, pas de PWA/service worker.

## Stack choisie

### Frontend
- **Next.js 14+ (App Router)** + TypeScript
- **Tailwind CSS** (pas de lib UI lourde, composants maison)
- **next/font** pour Inter/Sora
- Hébergement : **Vercel** (SSR pour profil public, ISR si besoin)

Pourquoi Next.js : SSR ultra-léger pour `/{username}` (SEO + perf 3G), routing simple, hosting gratuit.

### Backend
- **Supabase** (Postgres + Auth + Storage + RLS)
  - Auth : email/password
  - DB : Postgres
  - Storage : avatars + portfolio
  - Realtime : non utilisé au MVP

Alternative écartée : Firebase (moins SQL), custom Nest/Express (overkill).

### Base de données
- Postgres Supabase, RLS activée.

### Authentification
- Supabase Auth email/password.
- Pas d’OTP téléphone au MVP.
- Session via Supabase SSR helpers (`@supabase/ssr`).

### Stockage
- Supabase Storage, buckets : `avatars`, `portfolio`
- Règles : public read, authenticated write own files.
- Compression : client (browser-image-compression) + serveur : webp, max 1200px, <200kb.

### QR Code
- Lib : `qrcode` (npm) côté client pour génération PNG. Pas de service externe.

### Email
- **Resend** (ou Supabase email par défaut au MVP) pour transactional (welcome, reset password). Pas de newsletter au MVP.

### Analytics (SHOULD HAVE)
- Table `events` maison (vues, clics). Pas de Plausible/GA au MVP pour rester léger et RGPD simple. Ajoutable plus tard.

### i18n
- **next-intl** ou simple JSON `fr.json` / `en.json`. Pas de CMS traduction.

### Déploiement
- Vercel (frontend) + Supabase Cloud (backend).
- Env : `preview` (branch) + `production`.
- CI : Vercel auto-deploy sur push main.

## APIs externes
- Aucune obligatoire au MVP (pas de WhatsApp API, pas de SMS, pas de paiement).

## Variables d’environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY= (serveur uniquement)
NEXT_PUBLIC_SITE_URL=https://bizko.co
RESEND_API_KEY= (optionnel MVP)
```

## Architecture
```
Client (Next.js) → Supabase (Auth/DB/Storage)
                → Vercel Edge (SSR /{username})
Profil public : SSR, cache 60s (revalidate), pas de JS lourd
Dashboard : CSR + Server Actions
```

## Principes d’architecture
- Un seul repo, pas de monorepo.
- Server Actions / Route Handlers pour mutations, pas d’API custom séparée.
- RLS = source de vérité sécurité, pas de check côté client seul.
- Profil public : 0 dépendance lourde, pas de framer-motion, pas de carousel lib.
- Pas de PWA, pas de service worker, pas d’offline.

## Non inclus au MVP
- Paiement (Wave/Orange Money/Stripe)
- WhatsApp Cloud API
- Search/Elastic
- CDN custom (Vercel suffit)
- Sentry (ajoutable V1.1)
