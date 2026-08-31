# Vidéos dans les réalisations — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Permettre d'ajouter des vidéos (upload direct) en plus des images dans le portfolio (`portfolio_items`), avec miniature dans la grille et lecture plein écran en lightbox lazy-load.

**Architecture:** On garde la même table `portfolio_items`, on renomme `image_url` → `media_url`, on ajoute `media_type` (image|video) et `thumbnail_url` (requis pour vidéo). Upload direct vers le bucket `portfolio`. Le composant `PortfolioGallery` (public) et la lightbox gèrent les deux types.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind, Supabase, Vitest + Testing Library.

---

### Task 1: Migration SQL — table `portfolio_items`

**Files:**
- Create: `supabase/migrations/20250831000009_portfolio_videos.sql`

**Step 1: Écrire la migration**

```sql
-- Portfolio media : supports images ET vidéos uploadées
alter table public.portfolio_items
  rename column image_url to media_url;

alter table public.portfolio_items
  add column media_type text not null default 'image'
    check (media_type in ('image','video'));

alter table public.portfolio_items
  add column thumbnail_url text;
```

**Step 2: Valider la syntaxe**

Pas d'exécution possible en local (aucun Supabase local installé). On vérifie visuellement que les statements sont corrects. Aucun test automatisé ici.

**Step 3: Commit**

```bash
git add supabase/migrations/20250831000009_portfolio_videos.sql
git commit -m "feat: add media_type and thumbnail_url to portfolio_items"
```

---

### Task 2: Types — `PortfolioItem` mis à jour

**Files:**
- Modify: `src/types/database.ts:26-32`

**Step 1: Écrire la modification**

```ts
export interface PortfolioItem {
  id: string;
  profile_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string | null;
  title: string | null;
  position: number;
}
```

Remplacer `image_url: string;` par les trois champs ci-dessus.

**Step 2: Vérifier typecheck**

Run: `npx tsc --noEmit`
Expected: les autres fichiers référençant `image_url` (Lightbox.tsx, Upload.tsx, PortfolioGrid.tsx, TabPortfolio.tsx, dashboard/actions.ts) produiront des erreurs — c'est normal, on les corrige dans les tâches suivantes. On ne "fix" pas encore.

**Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add media_type and thumbnail_url to PortfolioItem type"
```

---

### Task 3: Validation upload vidéo (TDD)

**Files:**
- Create: `src/lib/portfolioVideo.ts`
- Test: `src/lib/__tests__/portfolioVideo.test.ts`

**Step 1: Écrire le test qui échoue**

```ts
import { describe, it, expect } from "vitest";
import { validateVideoFile, VIDEO_CONFIG } from "../portfolioVideo";

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateVideoFile", () => {
  it("accepts a valid mp4 under limits", () => {
    const err = validateVideoFile(makeFile("clip.mp4", "video/mp4", 10 * 1024 * 1024));
    expect(err).toBeNull();
  });

  it("rejects wrong mime type", () => {
    const err = validateVideoFile(makeFile("clip.gif", "image/gif", 1000));
    expect(err).toContain("type");
  });

  it("rejects files over 50 MB", () => {
    const err = validateVideoFile(makeFile("big.mp4", "video/mp4", VIDEO_CONFIG.maxSizeBytes + 1));
    expect(err).toContain("taille");
  });

  it("exposes config constants", () => {
    expect(VIDEO_CONFIG.maxSizeMB).toBe(50);
    expect(VIDEO_CONFIG.maxDurationSec).toBe(60);
  });
});
```

**Step 2: Vérifier l'échec**

Run: `npx vitest run src/lib/__tests__/portfolioVideo.test.ts`
Expected: FAIL — module `../portfolioVideo` introuvable.

**Step 3: Implémenter**

```ts
export const VIDEO_CONFIG = {
  maxSizeMB: 50,
  maxDurationSec: 60,
  allowedMimeTypes: ["video/mp4", "video/webm"],
} as const;

export const maxSizeBytes = VIDEO_CONFIG.maxSizeMB * 1024 * 1024;

export function validateVideoFile(file: { type: string; size: number }): string | null {
  if (!VIDEO_CONFIG.allowedMimeTypes.includes(file.type)) {
    return `type-invalid`;
  }
  if (file.size > maxSizeBytes) {
    return `taille-invalid`;
  }
  return null;
}

export function validateVideoDuration(durationSec: number): string | null {
  if (durationSec > VIDEO_CONFIG.maxDurationSec) {
    return `duree-invalid`;
  }
  return null;
}
```

**Step 4: Vérifier le passage**

Run: `npx vitest run src/lib/__tests__/portfolioVideo.test.ts`
Expected: PASS (3 tests).

**Step 5: Commit**

```bash
git add src/lib/portfolioVideo.ts src/lib/__tests__/portfolioVideo.test.ts
git commit -m "feat: add video upload validation for portfolio"
```

---

### Task 4: i18n — nouvelles clés upload

**Files:**
- Modify: `messages/fr.json`
- Modify: `messages/en.json`

**Step 1: Ajouter les clés `upload`**

Dans `messages/fr.json`, bloc `upload` (~ligne 402-404), après `addImage` :

```json
"addVideo": "+ Ajouter une video",
"videoType": "Video",
"imageType": "Image",
"addVideoThumb": "Miniature de la video",
"videoUnsupported": "Format video non supporte (mp4 ou webm)",
"videoTooLarge": "Video trop lourde (max 50 Mo)",
"videoTooLong": "Video trop longue (max 60 s)",
"videoThumbRequired": "Une miniature est requise pour la video"
```

Mêmes clés en anglais dans `messages/en.json` :
```json
"addVideo": "+ Add video",
"videoType": "Video",
"imageType": "Image",
"addVideoThumb": "Video thumbnail",
"videoUnsupported": "Unsupported video format (mp4 or webm)",
"videoTooLarge": "Video too large (max 50 MB)",
"videoTooLong": "Video too long (max 60 s)",
"videoThumbRequired": "A thumbnail is required for the video"
```

**Step 2: Vérifier le JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/fr.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('ok')"`
Expected: `ok`

**Step 3: Commit**

```bash
git add messages/fr.json messages/en.json
git commit -m "feat: add i18n keys for video upload"
```

---

### Task 5: Upload — `PortfolioUpload` gère image + vidéo

**Files:**
- Modify: `src/components/Upload.tsx:56-95` (composant `PortfolioUpload`)

**Step 1: Écrire la logique**

Remplacer la fonction `PortfolioUpload` par une version qui propose 3 boutons via un menu "+ Ajouter" : **Image**, **Video**. Pour la vidéo, on demande aussi une thumbnail.

Approche retenue (simple, sans librairie supplémentaire) :
- Deux inputs cachés : `image/*` et `video/mp4,video/webm`.
- Bouton "+ Ajouter" ouvre un mini-menu (Image / Video).
- Pour la vidéo : l'utilisateur sélectionne d'abord la vidéo (validation), puis la thumbnail (validation image). On upload la thumbnail puis la vidéo, on insère la ligne `portfolio_items` avec `media_type: 'video'`, `media_url` (vidéo), `thumbnail_url`.

Code de remplacement du corps de `PortfolioUpload` :

```tsx
export function PortfolioUpload({ profileId }: { profileId: string }) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<File | null>(null);
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const nextPosition = async () => {
    const { data: existing } = await supabase
      .from("portfolio_items")
      .select("position").eq("profile_id", profileId)
      .order("position", { ascending: false }).limit(1);
    return existing && existing[0] ? existing[0].position + 1 : 0;
  };

  const uploadImageFile = async (file: File) => {
    const compressed = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1200, useWebWorker: true, fileType: "image/webp" });
    const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
    const path = `${profileId}/${Date.now()}-${safeName}.webp`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, compressed, { contentType: "image/webp" });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadRawFile = async (file: File, contentType: string, ext: string) => {
    const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
    const path = `${profileId}/${Date.now()}-${safeName}.${ext}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file, { contentType, upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    return data.publicUrl;
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file);
      const pos = await nextPosition();
      const { error: insertErr } = await supabase.from("portfolio_items").insert({
        profile_id: profileId, media_url: url, media_type: "image", position: pos,
      });
      if (insertErr) throw insertErr;
      router.refresh();
    } catch (err) { alert(String(err)); }
    finally { setUploading(false); setMenuOpen(false); }
  };

  const onVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const vErr = validateVideoFile(file);
    if (vErr) { alert(t("upload." + vErr)); return; }
    setPendingMedia(file);
    setMenuOpen(false);
  };

  const onThumbChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pendingMedia) return;
    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) { alert(t("upload.videoThumbRequired")); setUploading(false); return; }
      const videoUrl = await uploadRawFile(pendingMedia, pendingMedia.type, pendingMedia.type === "video/webm" ? "webm" : "mp4");
      const thumbUrl = await uploadImageFile(file);
      const pos = await nextPosition();
      const { error: insertErr } = await supabase.from("portfolio_items").insert({
        profile_id: profileId, media_url: videoUrl, media_type: "video", thumbnail_url: thumbUrl, position: pos,
      });
      if (insertErr) throw insertErr;
      router.refresh();
    } catch (err) { alert(String(err)); }
    finally { setUploading(false); setPendingMedia(null); }
  };

  // ... rendering avec bouton "+ Ajouter" qui ouvre un menu simple Image / Video
  // Deux labels cachés : input image (onImageChange), input video (onVideoSelect),
  // et si pendingMedia != null, un input thumbnail (onThumbChange) est montré.
}
```

Pour le rendu, on garde le comportement actuel minimal visible : le composant vient remplacer les deux labels du bloc JSX existant (lignes 89-94). Le plan ci-dessous décrit le contenu JSX complet à l'implémentation (bouton menu + 2 labels cachés + alerte si `pendingMedia` → prompt thumbnail).

> Note : le plan décrit la logique et les signatures. L'exécutant reproduira le JSX complet en s'appuyant sur l'existant (lignes 89-94) en y ajoutant le mini-menu et les inputs cachés.

**Step 2: Ajouter l'import**

En haut de `Upload.tsx`, ajouter :
```ts
import { validateVideoFile } from "@/lib/portfolioVideo";
```

**Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: plus d'erreur liée à `image_url` dans Upload.tsx ; il en reste dans Lightbox.tsx, PortfolioGrid.tsx, TabPortfolio.tsx, dashboard/actions.ts (tâches suivantes).

**Step 4: Commit**

```bash
git add src/components/Upload.tsx
git commit -m "feat: support video upload in portfolio uploader"
```

---

### Task 6: Lightbox + PortfolioGallery — rendu vidéo et thumbnail

**Files:**
- Modify: `src/components/Lightbox.tsx:106-153` (`PortfolioGallery` + `Lightbox`)

**Step 1: Adapter les types**

La prop `items` de `PortfolioGallery` devient :
```ts
items: { id: string; media_url: string; media_type?: 'image' | 'video'; thumbnail_url?: string | null; title?: string | null }[];
```

**Step 2: Grille — thumbnail + badge vidéo**

Dans la grille (ligne ~122) : utiliser `p.thumbnail_url || p.media_url` comme src de l'image. Afficher un badge ▶ si `p.media_type === 'video'`.

```tsx
<Image
  src={p.thumbnail_url || p.media_url}
  alt={p.title || ""}
  fill
  sizes="(max-width: 768px) 50vw, 320px"
  className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
/>
{p.media_type === "video" && (
  <span className="absolute inset-0 flex items-center justify-center">
    <span className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </span>
  </span>
)}
```

**Step 3: Lightbox — lecture vidéo**

Transformer `Lightbox` pour accepter des médias mixte. On change `images: LightboxImage[]` en `items: { src: string; type?: 'image'|'video'; alt: string }[]`, et dans le rendu central (ligne ~86) :

```tsx
{items[current].type === "video" ? (
  <video key={items[current].src} src={items[current].src} controls autoPlay playsInline
    className="max-h-[85vh] w-auto max-w-[90vw] rounded-lg">
    {items[current].alt && <track kind="captions" />}
  </video>
) : (
  <img src={items[current].src} alt={items[current].alt} className="max-h-[85vh] w-auto object-contain rounded-lg" />
)}
```

Les boutons prev/next et le compteur restent inchangés (la navigation entre médias image+vidéo fonctionne par index).

**Step 4: Appel depuis PortfolioGallery**

`PortfolioGallery` mappe les items en `{ src: p.media_url, type: p.media_type, alt: p.title || "" }` pour la lightbox.

**Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: plus d'erreur `image_url` dans Lightbox.tsx.

**Step 6: Commit**

```bash
git add src/components/Lightbox.tsx
git commit -m "feat: render video media with badge and lazy-load lightbox playback"
```

---

### Task 7: Dashboard — PortfolioGrid et TabPortfolio

**Files:**
- Modify: `src/components/dashboard/PortfolioGrid.tsx:8-13` et `:51`
- Modify: `src/components/dashboard/TabPortfolio.tsx:7-12`

**Step 1: Mettre à jour les interfaces**

Dans `PortfolioGrid.tsx` (interface du composant, ligne 8-13) :
```ts
interface PortfolioItem {
  id: string;
  media_url: string;
  media_type?: 'image' | 'video';
  thumbnail_url?: string | null;
  title: string | null;
  position: number;
}
```

Dans `TabPortfolio.tsx` (interface, ligne 7-12) : même changement.

**Step 2: Grille dashboard — montrer la miniature**

Ligne 51 : remplacer
```tsx
<img src={p.image_url} alt="" ... />
```
par
```tsx
<img src={p.thumbnail_url || p.media_url} alt="" ... />
```

**Step 3: Typecheck + build**

Run: `npx tsc --noEmit`
Expected: plus d'erreur `image_url` restante (dashboard/actions.ts à traiter en Task 8).

**Step 4: Commit**

```bash
git add src/components/dashboard/PortfolioGrid.tsx src/components/dashboard/TabPortfolio.tsx
git commit -m "feat: dashboard portfolio grid shows video thumbnails"
```

---

### Task 8: Dashboard actions — suppression storage média

**Files:**
- Modify: `src/app/dashboard/actions.ts:133-156`

**Step 1: Mettre à jour `deletePortfolio`**

Changer le select `image_url` → `media_url`, et supprimer aussi la thumbnail du storage si présente.

```ts
const { data: item, error: fetchError } = await supabase
  .from("portfolio_items")
  .select("media_url, thumbnail_url, media_type")
  .eq("id", id)
  .eq("profile_id", user.id)
  .single();
if (fetchError || !item) redirect("/dashboard?error=generic");

const { error } = await supabase.from("portfolio_items").delete().eq("id", id).eq("profile_id", user.id);
if (error) redirect(`/dashboard?error=${dashboardError(error)}`);

for (const url of [item.media_url, item.thumbnail_url]) {
  if (!url) continue;
  try {
    const publicUrl = supabase.storage.from("portfolio").getPublicUrl("").data.publicUrl;
    const cleanUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
    if (url.startsWith(cleanUrl)) {
      const path = url.slice(cleanUrl.length + 1);
      await supabase.storage.from("portfolio").remove([path]);
    }
  } catch { /* ignore storage cleanup failures */ }
}
```

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: aucune erreur restante.

**Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

**Step 4: Commit**

```bash
git add src/app/dashboard/actions.ts
git commit -m "feat: clean up video media and thumbnail on portfolio delete"
```

---

### Task 9: Typecheck global, tests et lint finaux

**Files:**
- Vérification globale

**Step 1: Tests**

Run: `npm run test:run`
Expected: tous les tests passent (existants + nouveaux portfolioVideo.test.ts).

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: aucune erreur.

**Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

**Step 4: Build**

Run: `npm run build`
Expected: build réussi.

**Step 5: Commit si corrections**

```bash
git add -A
git commit -m "chore: verify full test suite passes"
```
(si aucun changement, ne pas committer)

---

## Rappels
- Ne jamais exécuter la migration (déploiée via Supabase par l'utilisateur) en local — aucune CLI Supabase locale.
- Le renommage `image_url` → `media_url` touche 5 fichiers ; chaque tâche ne corrige que le sien pour isoler les commits.
- La RLS existante (par `profile_id`, `on delete cascade`) couvre déjà les nouveaux champs — aucune policy à ajouter.
- Pour la lightbox vidéo, le `key` sur `<video>` force le rechargement quand on change de média.
