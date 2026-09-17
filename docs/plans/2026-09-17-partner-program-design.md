# Design — Programme Partenaire Bizko (V1)

Date : 2026-09-17
Statut : validé (design review le 2026-09-17)

Un système de partenaires/affiliation complet : l'admin active manuellement des partenaires,
ceux-ci reçoivent un accès Pro (sans paiement), un lien de parrainage, un espace partenaire,
et gagnent des commissions sur les paiements des utilisateurs qu'ils apportent, avec retraits manuels.

Chariow et Whop ne sont PAS la source de vérité du partenariat : Bizko l'est. Ils ne font que
confirmer les paiements (webhooks) ; Bizko gère partenaires, referrals, commissions, soldes et retraits.

## Décisions actées

- **Commission récurrente** : chaque paiement confirmé (y compris renouvellements Whop) génère une commission.
- **Taux par défaut : 30 %** (integer, modifiable par l'admin, range 1–100).
- Attribution définitive et unique : un utilisateur ne peut être lié qu'à un seul partenaire (1er arrivé), jamais modifié côté utilisateur.
- Auto-parrainage interdit (partenaire ne peut pas être référent de lui-même).
- Retrait minimum : 5 000 XOF. Paiement manuel par l'admin.
- Statuts commission : `pending` (réservé pour un futur flux manuel, inutilisé en V1) / `approved` (acquis, défaut) / `paid` (couvert par un retrait payé).
- Statuts payout : `pending` / `paid` / `rejected`.
- Aucun DELETE applicatif sur referrals / payments / commissions / payouts : l'historique n'est jamais purgé.
  La désactivation d'un partenaire ne supprime rien, elle ne fait que passer `is_partner = false`.
- Devise : XOF partout (Chariow XOF, Whop XOF). `amount` stocké en integer (devise à 0 décimal).

## 1. Schéma — migration `supabase/migrations/20260917000002_partner_program.sql`

### `profiles` (colonnes ajoutées)
- `is_partner boolean not null default false`
- `partner_code text` unique (nullable) — stable, conservé à la désactivation (un ré-ajout ne régénère pas)
- `commission_rate integer not null default 30 check (commission_rate between 1 and 100)`

### `referrals`
```
id uuid pk default gen_random_uuid()
partner_id uuid not null references profiles(id) on delete cascade
referred_user_id uuid not null references profiles(id) on delete cascade
source text not null check (source in ('partner_link','partner_profile'))
created_at timestamptz not null default now()
unique (referred_user_id)      -- attribution définitive, un seul partenaire
index (partner_id)
```
RLS : select si `partner_id = auth.uid()` ; insert si `referred_user_id = auth.uid()` + partenaire actif + `partner_id <> referred_user_id` ; pas d'update/delete.

### `payments`
```
id uuid pk default gen_random_uuid()
profile_id uuid not null references auth.users(id) on delete cascade   -- le payeur (l'utilisateur apporté)
provider text not null check (provider in ('whop','chariow'))
provider_payment_id text not null unique                              -- sale id Chariow / payment id Whop
amount integer not null                                              -- XOF
currency text not null default 'XOF'
interval text not null default 'monthly' check (interval in ('monthly','yearly'))
plan text not null default 'pro'
status text not null default 'succeeded' check (status in ('succeeded','failed','refunded'))
created_at timestamptz not null default now()
index (profile_id)
```
Écrit uniquement par les webhooks (service role). RLS : select si le payeur lui-même OU son partenaire.

### `commissions`
```
id uuid pk default gen_random_uuid()
partner_id uuid not null references profiles(id) on delete cascade
referred_user_id uuid not null references profiles(id) on delete cascade
payment_id uuid not null unique references payments(id) on delete cascade   -- 1 commission max par paiement
amount integer not null
status text not null default 'approved' check (status in ('pending','approved','paid'))
payout_id uuid references payouts(id)                                        -- lié quand le retrait est payé
created_at timestamptz not null default now()
index (partner_id), index (partner_id, status)
```
RLS : select si `partner_id = auth.uid()` ; pas d'écriture client.

### `payouts`
```
id uuid pk default gen_random_uuid()
partner_id uuid not null references profiles(id) on delete cascade
amount integer not null check (amount >= 5000)
method text not null
account_identifier text not null
account_holder text
details text
status text not null default 'pending' check (status in ('pending','paid','rejected'))
created_at timestamptz not null default now()
paid_at timestamptz
index (partner_id), index (status)
```
RLS : select/insert si `partner_id = auth.uid()` ; pas d'update/delete client.

## 2. Pro via partenariat

- `is_pro(uuid)` étendu (réécrit dans la migration) :
  `... OR exists (select 1 from profiles where id = p_profile_id and is_partner)`
  → tout le gating existant (templates, R2, actions dashboard, onboarding) hérite de l'accès sans table subscription.
- `isProSubscription` (lib/plans.ts) inchangé : il raisonne sur une ligne subscription ; le Pro partenaire n'en produit aucune.
- Page `dashboard/subscription` + `SubscriptionClient` : si `profiles.is_partner` → carte « Pro via partenariat »
  (badge Actif, durée illimitée « tant que le partenariat est actif », PAS de boutons acheter/renouveler/switch/manage),
  + lien vers `/dashboard/partner`.

## 3. Acquisition & tracking

- `src/lib/partner/tracking.ts` :
  - `PARTNER_CODE_PATTERN` regex de validation du ref (`^[a-z0-9_]{3,60}_[a-z0-9]{4,8}$`).
  - `generatePartnerCode(username)` → `${username}_${6 caractères aléatoires [a-z0-9]}` (unicité vérifiée en base avant insert).
- Middleware `src/lib/supabase/middleware.ts` : sur `pathname === "/"` avec `?ref=` valide →
  pose un cookie HttpOnly `bizko_ref` = `{ ref, source }` (source `partner_link` par défaut, `partner_profile` si `&source=profile`),
  durée 30 jours, puis redirect vers `/` (URL propre). Capture en tête du middleware (avant les retours précoces).
- Onboarding `src/app/onboarding/actions.ts` : dans le bloc `if (!existingProfile)`, après l'insert du profil,
  lecture du cookie `bizko_ref`, lookup partenaire (`partner_code = ref`, `is_partner = true`, `id <> user.id`),
  insert du `referral` (source), puis suppression du cookie. Échec non fatal (log, on continue).
- `ProfileView.tsx` : si `profile.is_partner && profile.partner_code` → `href="/?ref=<code>&source=profile"` sinon `/`.
  L'URL publique du profil reste `bizko.pro/<username>` (aucun ref dans l'URL).
  `PublicProfileData.profile` transporte `is_partner` + `partner_code` (déjà dans `select *` ; types → `src/types/database`).

## 4. Commissions (webhooks)

Helper `src/lib/partner/commissions.ts` → `handleConfirmedPayment({ profileId, provider, providerPaymentId, amount, currency, interval, plan })` :
1. upsert `payments` (`onConflict: 'provider_payment_id'`) → si déjà présent, STOP (idempotent).
2. select referral du payeur (`referred_user_id = profileId`).
3. si pas de referral → aucune commission (la payment est quand même enregistrée).
4. partenaire : `profiles` du `partner_id` doit avoir `is_partner = true` (sinon rien).
5. insert `commissions` (`amount = round(total * commission_rate / 100)`, `status = 'approved'`,
   `onConflict: 'payment_id'` → STOP si doublon).
Toute exception → throw → le webhook répond 500 → retry provider. Les contraintes uniques protègent même en cas de bug applicatif.

- **Whop** `payment.succeeded` : après l'existant `upsertActive`, extraire :
  - `provider_payment_id` = `event.data.id` (fallback `event.id`).
  - montant : `extractWhopAmount(event.data)` (clés candidates `amount`/`total`), fallback
    `listMembershipPayments(membershipId)` (membre du `data` ou `whop_membership_id` de la subscription) matche le payment id → `total`/`currency`.
  - interval : `derivePlanInfo(data.plan_id)` (défaut monthly).
  - Seul `payment.succeeded` crée payment+commission (pas `membership.activated`, pour éviter les doublons).
- **Chariow** `successful.sale` : après l'existant upsert subscription :
  - `provider_payment_id` = `sale.id`.
  - montant : `extractSaleAmount(sale)` (clés candidates `total`/`amount` notamment), fallback API `GET /sales/{id}`
    (ajout `getSale(saleId)` dans `src/lib/chariow.ts`). Si montant introuvable → pas de commission, log (ne jamais inventer).
  - interval : `resolveChariowInterval(productId)`.
- `src/lib/whop.ts` : ajouter `getPayment(paymentId)` (ou utiliser `listMembershipPayments` + match) pour le fallback montant.

## 5. Espace Partenaire — `/dashboard/partner`

- Server component + garde : `profiles.is_partner = true` requis (sinon `notFound()`).
- Lien d'accès : ajout d'un item « Espace Partenaire » dans la navigation dashboard quand `is_partner` (repérer le layout/nav existant).
- Vue générale (cartes) :
  - utilisateurs apportés (count referrals), ayant souscrit (count payeurs distincts avec payment),
    commissions générées (Σ commissions), en attente (Σ status pending — 0 en V1), disponibles (Σ approved non réservées),
    déjà payées (Σ status paid), **solde disponible pour retrait**.
- **Solde disponible** = `Σ(commissions approved) − Σ(payouts pending+paid)` : les demandes en cours réservent les fonds
  (empêche les doubles demandes). À `paid`, les commissions couvertes (FIFO, montant exact) passent `paid` + `payout_id`.
- Lien partenaire : `https://bizko.pro/?ref=<code>` + bouton copier (clipboard, fallback textarea).
- Historique : tableau referrals (utilisateur, date, source, paiement, commission, statut) — jointures server-side (RLS partenaire).
- Retraits : liste des payouts + formulaire « Demander un retrait » (montant = solde disponible, minimum 5 000 XOF ;
  méthode, numéro Mobile Money, titulaire, détails). Désactivé si disponible < 5 000.
  Server action : revalide identité + `is_partner`, recalcule le solde serveur, insert payout `pending`.
- Requêtes serveur via le client authentifié (RLS partenaire).

## 6. Admin — `/admin/partners`

- Ajout « Partenaires » dans `AdminSidebar` (navigation admin existante).
- Liste : tous les profils `is_partner = true` + leurs stats (apportés, paiements générés, commissions, retraits).
- Actions (server actions, double contrôle `is_admin` côté serveur AVANT tout accès service-role) :
  - `activatePartner(userId, rate)`: génère `partner_code` (si absent), `is_partner = true`, `commission_rate` (défaut 30).
    Revalidation cache public profiles (`updateTag(PUBLIC_PROFILES_TAG)`).
  - `deactivatePartner(userId)`: `is_partner = false` (historique conservé ; les nouveaux referrals et commissions sont bloqués par la garde `is_partner`).
  - `setCommissionRate(userId, rate)`.
  - `markPayoutPaid(payoutId)`: payout `pending → paid` (paid_at=now()), commissions FIFO du partenaire
    (Σ = montant du payout) → `payout_id` + `status = 'paid'`.
  - `rejectPayout(payoutId)`: `pending → rejected` (commissions intactes).
  - Détail partenaire : utilisateurs apportés / paiements / commissions / retraits (service-role après contrôle admin).
- Les données admin sont lues via `createAdminClient()` dans des composants/actions serveur qui vérifient `is_admin`
  (même niveau de confiance que les RPC `_require_admin` existants).

## 7. Sécurité / RLS

- Toutes les nouvelles tables : RLS activé. Politiques listées en §1.
- Solde, taux, montants, minima : toujours recalculés côté serveur. Le client n'est jamais une autorité
  (un partenaire ne peut pas toucher à son taux, ses commissions, ni marquer un payout payé).
- Toute écriture admin passe par le service-role après contrôle `is_admin` serveur (jamais le client RLS).
- Les taux/numbers envoyés par les forms sont revalidés (parse + bornes) côté serveur.

## 8. i18n & design

- `messages/fr.json` + `messages/en.json` : namespace `partner` (labels dashboard, admin, retraits, formulaire, validations).
- Design cohérent avec les composants dashboard/admin existants (cartes, badges, tables) — pas de nouvelle lib.
- L'utilisateur normal ne voit aucun élément partenaire (nav, section, liens).

## 9. Tests

- `src/lib/__tests__/partner.test.ts` :
  - math commission (`round(total × rate/100)`), génération de code + format, validation de ref.
  - solde disponible (approuvées − pending/paid payouts), FIFO de liaison des commissions à un payout payé.
  - gating : partenaire inactif → pas de commission ; self-referral → pas de referral ; source par défaut.
- Tests webhooks existants étendus (Whop `payment.succeeded` + Chariow `successful.sale` → payment + commission créés,
  double envoi → une seule commission).
- `npx tsc --noEmit`, `npx eslint`, `npx vitest run`.

## 10. Parcours final attendu

```
Utilisateur normal → compte normal.
Utilisateur devient partenaire → is_partner=true, Pro, espace partenaire, lien partenaire.
Visiteur via lien partenaire → attribution cookie → compte créé → referral en base.
Visiteur via "Fait avec Bizko" (profil d'un partenaire) → /?ref=<code>&source=profile → idem, source=partner_profile.
Paiement confirmé (Chariow ou Whop) → payment + commission (30%, récurrent, approuvée).
Partenaire ≥ 5 000 XOF → demande de retrait (reserve les fonds).
Admin marque payé → commissions FIFO liées + payout paid ; rejet → payout rejected.
Partenaire désactivé → Pro partenaire + espace retirés, historique conservé.
```