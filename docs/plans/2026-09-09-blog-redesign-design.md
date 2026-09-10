# Design : refonte éditoriale premium du blog Bizko

Date : 2026-09-09
Statut : validé par le membre
Portée : `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, composants partagés

## Contexte

Le blog (`/blog`) affiche une liste minimale et les articles sont rendus en prose
brute. Objectif : un rendu moderne, beau, premium, tout en gardant la palette
Bizko (fond blanc, Inter, accent orange `#ff6b35`, bordure `#e5e7eb`).

Direction choisie : **éditoriale premium** (inspiration : publications type The
Verge / Stripe / magazine). Visuels des cartes : **bannière générée** (pas
d'images lourdes, futur champ `cover` supporté). Page article : **pack complet**
(bannère, temps de lecture, sommaire, partage, bloc auteur, cartes "à lire aussi").

## Principes

- Zéro image à charger : bannières générées en pure CSS (dégradés + typo).
- Déterministe : même slug → même bannière, pas de random au build.
- SEO intact : JSON-LD, canonical, breadcrumb conservés.
- Aucun changement de frontmatter : le type `PostFrontmatter` gagne un
  `cover?: string` optionnel, honoré s'il existe, sinon bannière générée.

## Index `/blog`

- Masthead : wordmark "Bizko" (lien `/`) à gauche, lien "Créer ma page" à droite.
- Hero éditorial : eyebrow `BLOG` orange espacé, H1 « Conseils pour les
  indépendants » (`text-4xl/5xl`, tracking-tight), sous-titre grisé, fine
  bordure basse.
- Article vedette : le plus récent — layout 2 colonnes (bannière | texte),
  méta complète, bouton « Lire l'article ».
- Grille : 2 colonnes (1 en mobile), `PostCard` — bannière 16:9 avec étiquette
  de type, pastille de type, titre `text-xl`, description en extrait, méta
  (date · temps de lecture).
- Hover : élévation douce, bordure accent, zoom 1.03 de la bannière, transition
  `cubic-bezier(0.16,1,0.3,1)`.

## Page article

- Bannière générée en tête (ratio 21:9 sur desktop, arrondie), étiquette de type.
- Header : pastilles de tags, H1 `text-4xl/5xl`, description `text-xl` grisée.
- Bloc méta : avatar initial (auteur, repli « Équipe Bizko »), date, temps de
  lecture, `ShareButton` « Copier le lien » avec feedback « Copié ! ».
- Sommaire : extrait des `##`/`###` du MDX, ancres slugifiées, carte encadrée
  au-dessus du corps.
- Corps : `prose prose-lg`, titre avec `scroll-mt-24`, liens accent.
- FAQ : cartes spacieuses bordées, numéro en accent.
- Sources : liste numérotée, icône de lien externe.
- Bloc auteur stylisé + permalien en bas.
- « À lire aussi » : cartes `PostCard` ; si `related` vide → 2 derniers publiés.

## Technique

- `src/lib/blog/text.ts` : `readingTime(content)`, `extractToc(content)`,
  `slugify(text)` (décompose accents FR, ASCII).
- `src/mdx-components.tsx` : override `h2`/`h3` pour injecter `id` (même
  slugify) + `scroll-mt-24`.
- `src/components/blog/BlogBanner.tsx` : gradient déterministe par seed
  (palette encre/orange), label en grande typo, blob décoratif, support `cover`.
- `src/components/blog/PostCard.tsx` : carte réutilisable (index + related).
- `src/components/blog/ShareButton.tsx` : client, copie `location.href`,
  feedback d'état.

## Hors périmètre

- Ajout du lien `/blog` dans la nav/footer du site.
- Newsletter ou lead magnet sur le blog.