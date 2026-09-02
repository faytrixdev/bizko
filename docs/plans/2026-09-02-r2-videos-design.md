# Design — Vidéos R2 (Cloudflare) + compression client

## Contexte
Les vidéos des réalisations sont aujourd'hui stockées dans le bucket Supabase `portfolio`.
Le plan gratuit Supabase limite le stockage fichiers à 1 Go (et l'egress à 5 Go) : trop
juste pour des vidéos lourdes. On migre **les vidéos seules** vers **Cloudflare R2**
(10 Go gratuits, egress non facturée) et on **compresse les vidéos dans le navigateur**
avant l'upload pour réduire la place consommée.

## Décisions validées
- **Portée** : seules les **vidéos** migrent vers R2. Images et avatars restent sur Supabase.
- **Serveur Vercel** : pas de proxy des gros uploads (limites Vercel) → upload **direct du
  navigateur vers R2** via une URL pré-signée (PUT).
- **Compression avant upload** : ffmpeg.wasm côté client → **H.264/MP4**, 1080p, ~3-4 Mbps.
  Réduit une vidéo de 200-500 Mo à ~60-90 Mo.
- **Bucket R2 public** : les visiteurs streament depuis une URL publique (custom domain ou
  `*.r2.dev`). `media_url` stocke cette URL → **aucun changement côté affichage**
  (Lightbox/grilles lisent déjà `media_url`).
- **miniature** (`thumbnail_url`) : reste sur Supabase (inchangé).
- **Clés R2** fournies par l'utilisateur (env vars) ; jamais exposées au client.

## Architecture
```
Utilisateur choisit une vidéo
   ↓
ffmpeg.wasm compresse en H.264 MP4 (1080p, ~3-4 Mbps)
   ↓
Navigateur → POST /api/r2/sign  (serveur : auth + mint une URL PUT pré-signée)
   ↓
Navigateur → PUT blob directement vers R2 (bucket public)
   ↓
Choisit une miniature → compression image (flux Supabase existant)
   ↓
insert portfolio_items : media_url (R2) + thumbnail_url (Supabase) + media_type='video'
   ↓
Les visiteurs streament la vidéo depuis l'URL publique R2 (affichage inchangé)
```

## Fichiers

### Nouveaux
- **`src/lib/r2.ts`** — client S3 (R2) via `@aws-sdk/client-s3` :
  - `createPresignedPut(key, contentType)` → URL PUT pré-signée
  - `buildPublicUrl(key)` → URL publique du bucket
  - `deleteObject(key)` → suppression (nettoyage)
- **`src/app/api/r2/sign/route.ts`** — route serveur : vérifie l'auth, génère une URL PUT
  pré-signée pour une clé `portfolio/<userId>/<timestamp>-<name>.mp4`. Enforce une taille
  max côté serveur (ex. 150 Mo) pour éviter les gros uploads arbitraires.
- **`src/lib/clientTranscoder.ts`** — wrapper ffmpeg.wasm : `compressVideo(file, opts)` →
  `Blob` H.264 MP4. Charge ffmpeg en lazy (instance unique). Fallback : si ffmpeg échoue ou
  est trop lent (mobile), renvoie le fichier original (best-effort, ne bloque jamais).
- **`src/lib/__tests__/r2.test.ts`** — tests unitaires (URLs, forme de la requête de sign).

### Modifiés
- **`src/components/Upload.tsx`** — flux vidéo : compresser → demander l'URL pré-signée →
  PUT vers R2 → miniature (Supabase) → insert avec `media_url` R2. Indicateur de progression
  « Compression en cours… ». Nettoyage best-effort de l'objet R2 en cas d'échec.
- **`src/app/dashboard/actions.ts`** (`deletePortfolio`) — supprimer aussi l'objet R2
  (`media_url`) en plus du thumbnail Supabase.
- **`.env.local.example` + docs** — variables : `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`.

## Dépendances
- `@aws-sdk/client-s3` (client S3 compatible R2).
- `@ffmpeg/ffmpeg`, `@ffmpeg/core` (transcodage navigateur).

## Sécurité
- **URL pré-signée** : scopée sur un seul objet, courte durée (ex. 10 min) ; les secrets R2
  ne quittent jamais le serveur.
- **Route serveur** : vérifie la session utilisateur avant de signer (seul un user connecté peut uploader).
- **Taille max** enforce côté serveur au moment de la signature.

## Gestion d'erreur & cas limites
- ffmpeg.wasm indisponible/échoue (mobile) → fallback upload de la vidéo originale
  (best-effort, cohérent avec l'approche tolérante existante).
- Progression affichée pendant la compression (évite l'impression « rien ne se passe »).
- Échec d'upload R2 en cours de route → nettoyage de la miniature et de l'objet partiel.

## Tests (Vitest)
- R2 : construction des URLs, forme de la requête de sign (URL pré-signée + public URL).
- Orchestration mint→upload→insert avec `compressVideo` et `fetch` mockés.
- Config : constantes (résolution, bitrate, taille max).
- Conserver les 29 tests existants au vert.
