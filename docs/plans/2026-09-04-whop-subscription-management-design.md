# Design — Page de gestion d'abonnement Bizko Pro

> **Date** : 4 septembre 2026
> **Branche** : `master` (repo `C:\Users\PC\Documents\Bizko`)
> **Sujet** : Page SaaS-style `/dashboard/subscription` permettant aux utilisateurs Pro de gérer leur abonnement Whop en in-app (statut, annuler/réactiver, historique des paiements, état d'annulation en cours).

## Décisions validées
- **Source de vérité** : lecture **Whop en direct** (Approche A). La page interroge l'API Whop server-side (`GET /memberships/{id}` + `GET /payments`) à chaque affichage. Notre table `subscriptions` garde le mapping `profile_id → whop_membership_id` (et `is_pro`), mais n'est pas la source de vérité de l'état.
- **Emplacement** : nouvelle page `/dashboard/subscription`, accessible uniquement connecté (même garde que le dashboard). Bandeau Pro du dashboard y renvoie.
- **Portée** : les 4 éléments — résumé, annuler/réactiver, historique des paiements, état d'annulation en cours.
- **Pas de customer portal Whop** : tout passe par l'API Whop avec notre clé (l'utilisateur final n'a pas besoin de compte Whop).

## API Whop utilisée (côté serveur, Bearer notre clé)
- `GET /memberships/{id}` — statut, `formatted_renewal_price`, `current_period_end`, `cancel_at_period_end`, `plan_id`, `manage_url`.
- `POST /memberships/{id}/cancel` — corps `{ cancellation_mode: "at_period_end" | "now" }` (défaut `at_period_end`). Permission `membership:cancel`.
- `POST /memberships/{id}/uncancel` — réactive une annulation programmée. Permission `member:manage`.
- `GET /payments?query={membership_id}` — historique des paiements du membership (paginé, `first`). Permissions paiement/membre.

## Structure de la page `/dashboard/subscription`

### 1. En-tête / retour
- Lien retour vers `/dashboard` (« ← Tableau de bord »).

### 2. Carte « Mon abonnement » (résumé)
- **Badge statut** :
  - `active` → **Actif** (vert)
  - `cancel_at_period_end=true` → **Annulation en cours** (ambre) + échéance
  - `past_due` → **En retard** (rouge)
  - `canceled` / autre → **Annulé** (gris)
- **Forfait** : « Bizko Pro » + période (Mensuel / Annuel) déduite de `plan_id` vs `WHOP_PLAN_ID_PRO` / `WHOP_PLAN_ID_PRO_YEARLY`.
- **Prix** : formaté FCFA depuis `formatted_renewal_price` (fallback 2 500 FCFA/mois ou 20 000 FCFA/an).
- **Prochaine échéance** : `current_period_end` (masquée si annulé).
- **Renouvellement** : « Renouvellement automatique activé / annulé ».

### 3. Boutons d'action (selon état)
- **Actif** → bouton **Annuler l'abonnement** (rouge/barre) → modale de confirmation : « Tes avantages Pro restent actifs jusqu'au {échéance}, puis tu repasses en gratuit. Confirmer ? » → `cancel` (`at_period_end`).
- **Annulation en cours** → bouton **Réactiver l'abonnement** (vert/primary, sans modale) → `uncancel`.
- **Annulé / En retard** → bouton **S'abonner** → checkout (billing mensuel/annuel) existant.
- **Gratuit (non-Pro)** → bouton **Passer à Pro** → checkout existant (bandeau).

### 4. Historique des paiements
- Tableau (liste) des paiements récents via `GET /payments?query={membership_id}`.
- Colonnes : **Montant** (FCFA), **Date** (locale), **Statut** (Réussi / Échec), **Moyen** (carte •••• 1234 si dispo).
- Vide : message « Aucun paiement pour le moment ».

### 5. État « cancellation-in-progress »
- Badge ambre + texte explicatif + bouton réactiver + échéance affichée = état clairement visible.

### 6. Non-Pro / pas d'abonnement
- Carte d'invitation Pro avec CTA vers checkout (billing mensuel/annuel).

### 7. Erreurs / cas limite
- Whop indisponible → message d'erreur + bouton « Réessayer » (page serveur, gestion type `dashboardError`).
- Non connecté → redirection `/login`.

## Implémentation (fichiers)
- `src/lib/whop.ts` — helpers : `getMembership(id)`, `cancelMembership(id, mode)`, `uncancelMembership(id)`, `listMembershipPayments(membershipId)`.
- `src/app/dashboard/subscription/actions.ts` — Server Actions : `getSubscription()`, `cancelSubscription()`, `reactivateSubscription()`, `listPayments()`.
- `src/app/dashboard/subscription/page.tsx` — page serveur (garde login, résolution membership, construction des props).
- `src/app/dashboard/subscription/SubscriptionClient.tsx` — composant client (badge, boutons, modale, tableau).
- `src/app/dashboard/DashboardClient.tsx` — ajout d'un lien « Gérer l'abonnement » dans le bandeau Pro (si `isPro`).
- `messages/fr.json` + `messages/en.json` — nouvelles clés i18n.
- `src/lib/__tests__/whop.test.ts` (ou nouveau test) — helpers API (TDD).

## Tests (TDD — test d'abord)
- Helpers `getMembership` / `cancelMembership` / `uncancelMembership` / `listMembershipPayments` : méthode, chemin, headers auth, gestion d'erreur (mock fetch, type `FetchLike` existant).
- Résolution échéance / période (helpers purs).

> **Statut (4 sept. 2026)** : design validé par l'utilisateur. En attente de rédaction du plan d'implémentation (writing-plans) et du code.
