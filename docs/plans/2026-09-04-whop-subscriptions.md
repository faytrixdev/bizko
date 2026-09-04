# Plan — Abonnements Bizko Pro via Whop

> **Date** : 4 septembre 2026
> **Branche** : `feat/whop-subscriptions` (worktree `.worktrees/feat-whop`)
> **Objectif** : Permettre aux freelances de s'abonner au plan Bizko Pro (2 500 FCFA/mois, 14 j d'essai) via Whop, et d'appliquer les limites Pro/free côté serveur.

## Décisions validées (référence : docs/2026-09-03-strategic-analysis.md)
- Marché : toute l'Afrique francophone. Paiement : **Whop uniquement** (XOF), Mobile Money plus tard.
- Plans : Free + Pro (Business/Studio plus tard). Prix Pro 2 500 FCFA/mois / 20 000 FCFA/an.
- Liaison achat → profil : **metadata `profile_id`** au checkout Whop, webhook met à jour une table `subscriptions`.
- Limites validées :
  | Ressource | Free | Pro |
  |---|---|---|
  | Portfolio total | 9 | 30 |
  | Vidéos | 3 | illimité (≤ plafond portfolio) |
  | Durée vidéo | 3 min | 5 min |
  | Taille vidéo upload | 200 MB | 500 MB |
  | Qualité vidéo | 720p | 720p |
  | Services | 8 | 15 |
  | Réseaux sociaux | 6 | illimité (15) |
  | Templates | 2 | 6 |

## Architecture
- Checkout Whop avec `metadata: { profile_id }`
- Webhook `payment.succeeded` / `membership.activated` / `membership.deactivated` / `membership.cancel_at_period_end_changed` → upsert `subscriptions` (idempotent)
- Gating via server actions lisant `subscriptions` en DB (helper `currentLimits` + RPC `is_pro`)
- `is_pro()` RPC côté DB (SECURITY DEFINER) pour les vérifications DB-level
- `/api/r2/sign` applique les limites nombre/taille/portfolio selon le plan (corrige le trou de sécurité comptage)

## Stack / fichiers
- `supabase/migrations/20250904000000_whop_subscriptions.sql` — table `subscriptions` + RPC `is_pro()`
- `src/lib/whop.ts` — client Whop (`createCheckoutConfig`) + `verifyWebhook` (Standard Webhooks HMAC-SHA256)
- `src/lib/plans.ts` — limites free/pro, helpers purs (testables)
- `src/app/api/webhooks/whop/route.ts` — endpoint webhook (vérif signature, idempotent, service role)
- `src/app/dashboard/actions.ts` — `startSubscription` (crée le checkout Whop avec metadata profile_id) + gating services/socials selon plan
- `src/app/api/r2/sign/route.ts` — applique les limites (nb vidéos, nb portfolio, taille) selon le plan
- `src/app/dashboard/page.tsx` + `DashboardClient.tsx` — bannière "Passer à Pro" + passe `isPro`
- `src/components/Upload.tsx` — pré-vérif client vidéo selon plan (durée/taille)
- `src/components/dashboard/TabPortfolio.tsx` — plafond portfolio dynamique (9 ou 30)
- `messages/fr.json` + `messages/en.json` — i18n (bannière, erreurs limites, checkout)

## Tests
- `src/lib/__tests__/plans.test.ts` — limites free/pro (13 tests)
- `src/lib/__tests__/whop.test.ts` — verifyWebhook (signature valide/invalide/replay) (5 tests)
- TDD : chaque test d'abord, puis implémentation.

> **Statut (4 sept. 2026)** : implémentation terminée. 8 fichiers de tests / 53 tests passent. Lint propre sur les fichiers modifiés (4 erreurs lint préexistantes hors périmètre : ffmpeg-core.js, ConfirmDialog.tsx, consent-context.tsx). `tsc --noEmit` OK hors erreur préexistante `LayoutProps` dans layout.tsx. Backstop R2 (objet unique) remonté à 500 MB pour ne pas borner le plan Pro.

## Notes sandbox
- Config : sandbox-api.whop.com, sandbox.whop.com, clés dans `.env.local` (`WHOP_BASE_URL`, `WHOP_API_KEY`, `WHOP_WEBHOOK_SECRET`, `WHOP_PLAN_ID_PRO`)
- Webhook testé via Ngrok → URL publique → POST `/api/webhooks/whop`
- Cartes de test Whop sandbox.
- **Pas encore fait** : création des clés/sandbox par l'utilisateur, soumission de la migration, application du vrai plan Pro sur Whop.
