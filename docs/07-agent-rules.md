# 07 - Agent Rules Bizko

Manuel permanent pour tout agent de développement (humain ou IA) travaillant sur Bizko.

## Produit
- Ne jamais inventer de fonctionnalités. Se référer à `01-product.md` et `02-mvp.md`. Si non listé en MUST/SHOULD HAVE, c’est NOT NOW.
- Ne pas agrandir le MVP sans validation explicite du owner. Toute proposition hors MVP → noter en DÉCISION NÉCESSAIRE, ne pas builder.
- Prioriser la valeur conversion (WhatsApp) sur l’esthétique. Un profil qui ne génère pas de clic WhatsApp est un échec.
- Nom produit : Bizko (pas Kardly). Tagline : "Ton business en un lien." Domaine : bizko.me.
- Pas de PWA/offline au MVP. Online only.

## Design
- Mobile-first obligatoire. Designer à 375px d’abord.
- Interfaces simples, pas de dashboard SaaS générique généré par IA.
- Profil public = écran le plus important. Garder hiérarchie : Identité → CTA WhatsApp sticky → Services → Portfolio → Sociaux. Ne jamais déplacer le CTA sous le portfolio.
- Réutiliser composants existants. Pas de nouvelle lib UI sans raison.
- CTA WhatsApp toujours vert #25D366, dominant. Le reste secondaire.
- 2 templates skins uniquement, même structure HTML. Pas de builder drag & drop.
- Profil public < 1.5s sur 3G, < 100kb JS. Pas d’animation lourde, pas de carousel lib.

## Code
- Garder architecture simple : Next.js App Router + Supabase. Un repo, pas de monorepo.
- TypeScript strict, pas de `any`.
- Éviter abstractions inutiles, duplication de logique, ou remplacement d’un système fonctionnel sans raison.
- Respecter conventions existantes du projet (naming, folders, Tailwind).
- Server Actions / Route Handlers pour mutations, RLS comme source de vérité sécurité.
- Avant toute feature : lire `05-tech-stack.md` et la table concernée dans `06-database.md`.

## Base de données
- Ne jamais modifier le schéma sans raison. Voir `06-database.md`.
- Préserver intégrité : username unique, phone E.164, max 8 services / 9 portfolio / 6 sociaux enforce app + DB.
- RLS activée partout. Owner seul peut write son `profile_id`. Public read pour profils `is_public=true`.
- Ne pas créer de tables pour features NOT NOW (paiement, domaine, annuaire complet). Champs `is_public`, `city`, `category` déjà prévus pour futur.
- Données publiques vs privées : ne jamais exposer `auth.users` côté client.

## Développement - Workflow obligatoire
Avant d’implémenter une fonctionnalité :
1. Comprendre l’architecture existante (lire docs/ + code).
2. Lire la documentation pertinente (00-06).
3. Réutiliser le code existant si possible.
4. Implémenter la solution la plus simple qui respecte le design.
5. Tester manuellement sur mobile 375px + vérifier perf profil public.
6. Vérifier le résultat (profil public charge, wa.me correct, RLS ok).
7. Passer à la suite.

## Vérification avant de dire "c’est fait"
- `npm run build` passe sans erreur.
- Profil public `/{username}` s’affiche < 1.5s, CTA sticky visible, liens wa.me encodés corrects.
- Dashboard sauvegarde auto fonctionne, validation username/phone OK.
- RLS : un user ne peut pas éditer le profil d’un autre (tester avec 2 comptes).
- i18n FR/EN fonctionne, pas de texte hardcodé.

## Interdictions
- Ne pas ajouter de dépendance lourde (framer-motion, UI kits) sans validation.
- Ne pas builder de PWA/service worker.
- Ne pas builder d’annuaire / paiement / domaine perso au MVP.
- Ne pas remplacer Supabase Auth par custom.
- Ne pas commit de secrets (.env).

## Quand bloqué
Écrire `DÉCISION NÉCESSAIRE : [description]` dans le fichier concerné et demander au owner, ne pas décider seul.
