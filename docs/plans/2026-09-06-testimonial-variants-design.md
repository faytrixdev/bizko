# Design — Variantes de témoignages par template

**Date** : 2026-09-06
**Statut** : Validé par l'utilisateur (brainstorming).
**Portée** : Rendre le bloc témoignages distinctif par template, avec des mises en page différenciées (marquee auto-défilant, citation tournante, carousel, grilles), dans le cadre centré `max-w-md`.

---

## 1. Contexte & problème

### État actuel
- Chaque template affiche les témoignages en **liste verticale empilée** (`flex flex-col`), tous les 6 pareils.
- « Beaucoup de témoignages » = page très longue, pas de troncature (seul les Free sont limités à 2 publiés).
- Constat utilisateur : « on ne peut pas varier ? adapter en fonction des templates ? »

### Contrainte
- **Fondations templates = composants serveur** (pas de `"use client"`).
- **Pas de config Tailwind custom** : les animations se déclarent via `@keyframes` dans `src/app/globals.css` (précédents : `glow-pulse`, `mockup-float`).
- Cadre centré `max-w-md` conservé.
- Les tests existants ciblent `data-testid="testimonials"` (le block conteneur) dans chaque template.

## 2. Décisions validées

- **CSS pur par défaut** : marquee, crossfade cyclique → aucune gestion d'état, aucune dépendance, compatible composants serveur.
- **Seule exception** : carousel Obsidienne avec flèches → petit composant client dédié.
- **Pause de sécurité** : quand il n'y a qu'un seul témoignage, pas d'animation de boucle (rien n'a l'air cassé / vide).

## 3. Variantes par template

| Template | Identité | Variante | Technique |
|---|---|---|---|
| **Minimal** | Signature épurée | Liste compacte | Items réduits (padding/marge plus faibles), toujours vertical |
| **Portfolio** | Galerie papier | Grille 2 colonnes | `grid grid-cols-2` sur cartes blanches |
| **Studio** | Noir éditorial | Bande auto-défilante horizontale | `@keyframes marquee` translateX, boucle infinie, cartes largeur fixe |
| **Édito** | Magazine serif | Citation tournante (crossfade) | `@keyframes fade-cycle` + `animation-delay` échelonné, ~6s par citation |
| **Urban** | Collage vivant | Marquee rapide | `@keyframes marquee` sur les bulles colorées existantes |
| **Obsidienne** | Club noir | Carousel avec flèches | Composant client `TestimonialCarousel`, 1 carte visible, flèches ← → |

## 4. Architecture & composants

### CSS (`src/app/globals.css`)
- `@keyframes marquee` : translateX(0 → -50%/+marge) sur un conteneur `display:flex; width:max-content`.
- `@keyframes fade-cycle` : séquence opacité (visible → masqué) + `--d` (duration/animation-delay) via variables.
- Classes utilitaires : `.marquee-track`, `.marquee-paused-1`, `.fade-cycle-item`.

### Templates modifiés (JSX/CSS uniquement)
- `MinimalTemplate.tsx`, `PortfolioTemplate.tsx`, `StudioTemplate.tsx`, `EditoTemplate.tsx`, `UrbanTemplate.tsx` : réécriture du bloc `testimonials` (structure différente), **`data-testid="testimonials"` conservé** pour les tests.

### Nouveau composant client
- `src/components/templates/TestimonialCarousel.tsx` (`"use client"`) — props : `testimonials` (PublicTestimonial[]), `msg`, `locale`. State : `index`. Rend la carte courante + flèches. Réutilise `formatTestimonialDate` depuis `shared.tsx`.

### CSS pur, pas de dépendances
- Aucune lib d'animation ajoutée (pas de GSAP/framer) : marquee et crossfade sont des `@keyframes` simples.

## 5. Comportements & animation

- **Studio / Urban (marquee)** : boucle infinie ; le contenu est doublé (width `max-content`) pour un rebouclage continu sans saut ; pause au survol (`hover:[animation-play-state:paused]`).
- **Édito (crossfade)** : chaque citation : `transition` d'opacité via `animation-delay` calculée en CSS par index (ex. `delay: ${i * 6}s`), durée totale `n * 6s` ; CSS absolu → hauteur fixe du conteneur pour éviter les sauts (cartes `absolute inset-0`).
- **Obsidienne (carousel)** : boucle modulo (après la dernière → première) ; désactive les flèches si 1 seul élément ; `aria-label` sur le conteneur et les boutons.

## 6. Tests

- Les tests template existants (rendu de base + `data-testid="testimonials"`) restent valides : le premier témoignage doit rester visible dans le DOM (pas d'`overflow:hidden` qui le démonte, pas de rendu conditionnel qui le cache).
- Nouveau test pour `TestimonialCarousel` (render, navigation flèches, boucle). Utiliser `@testing-library/react` comme les autres tests template.
- Vérification finale : `npm run test:run` (187+ attendus), `npx tsc --noEmit`, `npm run build`, eslint sur les fichiers modifiés.

## 7. Hors périmètre

- Limitation du nombre de témoignages affichés (pas de `LIMIT` en requête) — décision séparée si besoin.
- Autres sections (services, portfolio, socials) : inchangées.
- Troncature « Voir plus » : non prévue.