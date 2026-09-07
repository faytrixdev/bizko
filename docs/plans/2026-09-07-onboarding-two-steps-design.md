# Design — Onboarding en deux étapes (ajout du choix de template)

Date : 2026-09-07 · Validé en brainstorming

## Contexte

L'onboarding actuel est une page unique avec trois sections (lien, identité,
service) qui soumet tout en une fois. Le template est codé en dur à `"minimal"`
dans `completeOnboarding`. Objectif : un parcours en **deux étapes** dont la
deuxième propose le choix du template, tout en réutilisant l'existant.

## Décisions

- **Deux étapes** :
  - Étape 1 : lien (username) + identité + premier service — contenu et
    présentation actuels, inchangés.
  - Étape 2 : choix du template.
- **Template : tout afficher, verrous Pro** — les 6 templates sont visibles,
  les 4 Pro affichent le badge + CTA upgrade vers `/pricing` (comme le
  dashboard), via le composant `TemplatePicker` réutilisé.
- **Un seul `<form>`** avec une navigation par `useState<1 | 2>` : l'étape non
  active est masquée en CSS (`hidden`), les champs restent montés dans le DOM.
  Aucune synchronisation d'état manuelle ; « Retour » restaure tout
  automatiquement.
- **Garde serveur** : un nouvel utilisateur est toujours sur le plan free — le
  serveur rejette tout template Pro avec `template_locked`. On ne fait jamais
  confiance au client (même pattern que `updateProfile` côté dashboard).

## Architecture

- `src/app/onboarding/page.tsx` : un seul `<form action={completeOnboarding}>`,
  état `step` local. Étape 1 = sections existantes ; Étape 2 = `TemplatePicker`
  + boutons « Retour » / « Publier mon Bizko ».
- `src/components/dashboard/TemplatePicker.tsx` : **aucune modification** —
  réutilisé tel quel (`current="minimal"`, `isPro={false}`). Rend déjà un
  `<input type="hidden" name="template">`.
- `src/app/onboarding/actions.ts` : lit `template` du formData (fallback
  `"minimal"`), valide `canUseTemplate("free", template)`, rejette sinon avec
  `error=template_locked`.

## i18n (clés ajoutées, fr + en)

- `onboarding.step1Of` / `step2Of` : badges « Étape 1/2 » / « Étape 2/2 »
- `onboarding.continue` : « Continuer » / « Continue »
- `onboarding.back` : « Retour » / « Back »
- `onboarding.errorTemplateLocked` : « Ce template nécessite l'offre Pro. »
  + mapping `template_locked` dans `ERROR_KEYS`

Les noms/descriptions de templates réutilisent les clés `dashboard.template*`
déjà présentes.

## Comportement & erreurs

- « Continuer » : laissé la validation HTML native (`required` / `pattern`)
  s'appliquer sur l'étape 1 avant de passer à l'étape 2.
- « Retour » : revient à l'étape 1 sans perte de données.
- Template Pro sélectionné à l'étape 2 → le serveur rejette et renvoie le
  message dédié affiché en haut de page (via les `searchParams` existants).

## Tests

- Vérification manuelle du parcours sur `/onboarding`.
- `npx tsc --noEmit`, lint sur fichiers modifiés, `npm run test:run` sans
  régression.
- Pas de nouvelle suite de tests dédiée : pas d'infra de test existante pour
  `/onboarding` ; la logique métier reste dans la server action.