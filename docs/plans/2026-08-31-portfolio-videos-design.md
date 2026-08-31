# Design — Vidéos dans les réalisations

## Contexte
Le portfolio (`portfolio_items`) n'accepte aujourd'hui que des images. Ce design ajoute
le support des vidéos uploadées directement, en conservant la même table et le même flux
d'affichage.

## Décisions validées
- **Multi-type portfolio** : chaque réalisation est une image ou une vidéo (upload direct).
- **Lightbox plein écran** pour la lecture vidéo (extension du `Lightbox.tsx` existant).
- **Thumbnail + lazy load** : la grille affiche une miniature (badge ▶ pour les vidéos),
  la vidéo ne se charge qu'à l'ouverture de la lightbox.
- **Limites upload vidéo** : 50 Mo, durée ≤ 60 s, formats mp4/webm.
- **Renommage** `image_url` → `media_url` (plus sémantique et extensible).
- **RLS inchangée** : les policies existantes sont déjà portées par `profile_id`.

## Base de données (migration)
Table `public.portfolio_items` :
- Renommer `image_url` en `media_url` (contient l'URL image OU vidéo).
- Ajouter `media_type text not null default 'image' check (media_type in ('image','video'))`.
- Ajouter `thumbnail_url text` (nullable ; requis pour les vidéos — miniature affichée dans la grille).

Nouveau fichier : `supabase/migrations/20250831XXXXX_portfolio_videos.sql`.

## Types (`src/types/database.ts`)
- `PortfolioItem.media_url: string` (renommé)
- `PortfolioItem.media_type: 'image' | 'video'`
- `PortfolioItem.thumbnail_url: string | null`

## Upload (composant Upload + server action)
- Le formulaire de réalisation propose un choix Image / Vidéo.
- **Image** : comportement actuel (compression client, webp).
- **Vidéo** :
  - Client : validation du type (mp4/webm), taille ≤ 50 Mo, durée ≤ 60 s.
  - Upload direct vers le bucket `portfolio`.
  - L'utilisateur fournit une **thumbnail** (image) séparée pour la grille.
  - Pas de compression vidéo côté serveur au MVP ; seule la taille est limitée.

## Affichage public (`src/app/[username]` + templates)
- **Grille** : miniature des réalisations (thumbnail pour vidéo, image pour image) + badge
  lecture ▶ discret sur les vidéos.
- **Tap vidéo** : lightbox plein écran avec `<video controls autoPlay>` en lazy-load.
- **Tap image** : lightbox existante inchangée.

## DOM types
- `PortfolioItem` : `media_url`, `media_type`, `thumbnail_url`.

## Tests (Vitest)
- Validation upload vidéo (type, taille, durée).
- Rendu grille : thumbnail + badge pour vidéo, image pour image.
- Lightbox vidéo s'ouvre avec `<video>` en lazy-load.

## Erreurs
- Vidéo sans thumbnail → bloqué à l'upload (message clair).
- Type/taille/durée invalides → message d'erreur dans le formulaire.
- Vidéo qui ne charge pas dans la lightbox → fallback (message/message d'erreur).
