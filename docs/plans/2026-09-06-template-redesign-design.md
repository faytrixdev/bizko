# Design — Refonte visuelle des 6 templates Bizko

**Date** : 2026-09-06
**Statut** : Validé par l'utilisateur (brainstorming).
**Portée** : Refonte complète des 6 templates publics (2 free + 4 pro), ancrage ouest-africain, avatars africains IA, visuels portfolio africains. Le cadre **centré** est préservé (contrainte utilisateur).

---

## 1. Contexte & problème

### Produit
Bizko = annuaire / vitrines de professionnels ouest-africains (XOF, villes : Abidjan, Dakar, Ouagadougou, Accra…). Chaque pro a une page publique `/username` rendue par un des 6 templates.

### Diagnostic (feedback utilisateur)
- « Tout à refaire : cards / composants génériques, layout boilerplate, palettes insipides, typographie faible, certains templates ratés. »
- **Point bloquant** : les avatars utilisés actuellement sont des visages **non africains** (incohérents avec l'audience).
- Le rendu actuel donne l'impression d'un « formulaire rempli » plutôt que d'une « page de marque ».

### Causes racine
1. **Squelette identique pour les 6** : `avatar rond → nom → tagline → ville → bio → boutons WhatsApp → sections empilées (mt-8)`. Seules les couleurs changent. Aucun layout iconique.
2. **Composants partagés génériques** : `TestimonialCard`, `PortfolioGallery`, `Avatar`, boutons WhatsApp réutilisés tels quels partout.
3. **Palettes timides** : gris-blanc-orange par défaut (`border-gray-100`, `shadow-sm`, `rounded-2xl` partout).
4. **Typo plate** : `text-3xl font-bold` générique, pas de vraie hiérarchie.

## 2. Décisions validées

### Contrainte structurelle (utilisateur)
- **Centrage préservé** : chaque template garde une colonne centrale (container `max-w-md`) avec blocs empilés verticalement. Pas de layouts asymétriques, full-bleed hors-container ou multi-colonnes « éditoriales larges ».
- La refonte se joue **à l'intérieur de la colonne** : fonds, typo, composants, espacements, traitement d'images, palettes.

### Philosophie (utilisateur)
- **Layouts uniques par template** : chaque template a une identité structurelle et visuelle distincte (pas juste une recoloration).

### Casting (utilisateur)
- **Avatars générés par IA** avec les prompts fournis (Section 5). L'utilisateur génère les visages, les fournit, on les branche dans `fixtures.ts`.
- Personas conservés (Awa, Mamadou, Yann, Clara, Jules, Nora) — seuls les visages changent.
- **Visuels portfolio** récupérés en ligne (Unsplash/Pexels), ancrage africain.

## 3. Identités par template

Cadre commun : colonne centrée `max-w-md`, fond via `bgClass` (comportement actuel conservé : `bg-white`, `bg-[#FAF7F2]`, `bg-[#0B0B0F]`).

### Minimal (free) — « Signature »
- **Layout** : épuré haut de gamme, grand nom en display typographique serré, vaste respiration, bio intégrée naturellement (pas de carte blanche encadrée), CTA géant.
- **Composants** : **aucune carte grise** — services en liste éditoriale séparée par des filets fins, prix en evidence.
- **Palette** : blanc pur, encre quasi-noire (`gray-900`), un seul accent sobre.
- **Typo** : display serré, hiérarchie par contraste de taille.
- **Signature** : la pureté. Moins, c'est plus.

### Portfolio (free) — « Galerie »
- **Layout** : **la galerie mène**. En-tête compact (avatar + identité en ligne), puis grille portfolio centrée en star de la page.
- **Grille** : asymétrique maîtrisée (pas de grille 3x3 uniforme) — cellules de hauteurs variées, toujours centrées.
- **Services** : chips inline ou liste compacte, ne volent pas la vedette.
- **Palette** : papier ivoire (`#FAFAF6` / `stone`), encre, accent chaud terre.
- **Typo** : grotesk net (Inter/Manrope), titres de sections affirmés.

### Studio (pro) — « Noir Éditorial »
- **Layout** : hero sombre centré, **typographie massive**, nom en très grande taille, labels uppercase espacés (tracking large), bio en texte clair sur fond sombre.
- **Composants** : filets épais (`border-t-2`), sections séparées par des règles blanches, boutons outline.
- **Palette** : vrai noir (`#0A0A0A`), blanc, **un seul accent électrique** (ex. `#D9FF4C` lime accord 2026).
- **Typo** : condensed + grotesk (Archivo Narrow / Space Grotesk condensé), nom géant.
- **Signature** : le contraste mono. Studio photo B&W.

### Édito (pro) — « Magazine de luxe »
- **Layout** : titre serif centré élégant, tagline en italique, **bio en pull-quote** (grande citation), services **numérotés « 01 · 02 · 03 »**.
- **Composants** : listes éditoriales avec règles hairlines, prix en chiffres serif, données alignées.
- **Palette** : parchemin crème (`#FAF7F2` conservé), encre charbon, **bronze doré** (`#B07D3D`).
- **Typo** : EB Garamond (titres) + sans élégant pour l'UI.
- **Signature** : le raffinement éditorial. Rien ne crie, tout se lit.

### Urban (pro) — « Collage vivant »
- **Layout** : formes pilules/tags centrées, **éléments qui fusionnent**, photo avatar avec anneau dégradé, sections avec dégradés d'ambiance.
- **Composants** : chips arrondies (`rounded-full`), cartes couleur pleine (pas de bordures grises), bouton dégradé.
- **Palette** : indigo profond (`#312E81`) + violet électrique (`#7C3AED`) + pop ambré (`#F59E0B`). Dégradés assumés.
- **Typo** : Sora + display accent ou condensed pour les titres.
- **Signature** : l'énergie. La rue, la culture, la créativité.

### Obsidienne (pro) — « Club noir profond »
- **Layout** : dark luxe, avatar dans un **halo lumineux** (ring doré + glow), **panneaux de verre teinté** (glassmorphism sombre), titre serif display clair.
- **Composants** : cards avec `backdrop-blur` + bordures translucides (`border-white/10`), accents or discrets, boutons outline doré.
- **Palette** : noir bleuté obsidienne (`#0B0B0F`), or (`#D4AF37` / `#E6C87A`), blanc cassé.
- **Typo** : serif display (Cormorant/Source Serif) + sans élancé.
- **Signature** : la nuit et l'or. Luxe discret.

## 4. Design system partagé (règles transverses)

- **Fini le trio** `border-gray-100 + shadow-sm + rounded-2xl` partout : chaque template définit son langage de carte/bouton/section.
- **Boutons WhatsApp** : la couleur `#25D366` reste une constante produit (identifiable), mais le style (plein/outline, radius, taille) est par template.
- **Typo** : chaque template déclare son couple (display + body) via les fonts déjà chargées ([username]/layout) ou ajouts ciblés si besoin.
- **Accessibilité** : contrastes vérifiés (surtout dark : texte sur `#0A0A0A/#0B0B0F`), focus ring conservé, tailles lisibles.
- **Tests** : les smoke tests par template (`__tests__/fixture.ts` + tests de rendu) doivent passer après refonte.

## 5. Avatars IA — prompts validés

Format : **carré 1:1**, généré par l'utilisateur dans son outil IA, workflow :
1. L'utilisateur génère les 6 visages avec les prompts ci-dessous.
2. L'utilisateur dépose les fichiers (`/public/avatars-demo/`) ou fournit les URLs.
3. On met à jour `AVATARS` dans `src/app/demo/fixtures.ts` (et le `avatar_url` des 6 profiles demo).

| Template | Persona | Prompt |
|---|---|---|
| Minimal | Awa Diallo, photographe, Abidjan | `Editorial headshot portrait of a confident young West African woman, late 20s, photographer, natural braids pulled back, elegant rust-orange blouse, soft genuine smile, bright airy studio, soft diffused daylight, clean light-neutral background, sharp focus on eyes, shot on 85mm f/1.8, high-end clean aesthetic, square 1:1.` |
| Portfolio | Mamadou Traoré, graphiste, Dakar | `Portrait of a charismatic West African man, mid 30s, graphic designer, short natural hair, black round glasses, mustard-yellow turtleneck, relaxed confident posture, warm paper-cream studio backdrop, warm soft key light, editorial magazine look, 50mm lens, shallow depth of field, square 1:1.` |
| Studio | Yann Kouassi, photographe N&B | `Dramatic black and white portrait of a young West African man, early 30s, photographer, bold crop below shoulders, wearing a black crew-neck tee, direct steady gaze, hard side lighting, deep black background, film grain, high contrast, fine-art studio portrait, 85mm, square 1:1.` |
| Édito | Clara Mensah, arch. intérieur, Accra | `Elegant editorial portrait of a poised West African woman, late 30s, interior architect, sleek low bun, cream silk blazer, warm confident expression, soft parchment-toned backdrop, gentle golden-hour window light, luxury magazine photography, fine porcelain skin tones, 50mm, square 1:1.` |
| Urban | Jules Zongo, designer urbain, Ouagadougou | `Vibrant portrait of a young stylish West African man, mid 20s, urban designer, faded denim jacket, orange beanie, big energetic smile, punchy saturated color palette, bold cobalt-blue studio backdrop with hard rim light, editorial streetwear look, 35mm, square 1:1.` |
| Obsidienne | Nora Bamba, couture, Dakar | `Moody luxury portrait of an elegant West African woman, early 30s, fashion couturière, silk headwrap in deep emerald, gold statement earrings, serene composed gaze, near-black studio with a warm golden rim light curling around her, obsidian glass reflections, high gloss editorial beauty, 85mm, square 1:1.` |

## 6. Visuels portfolio — sourcing en ligne (ancrage africain)

- **Sources** : Unsplash / Pexels (URLs distantes stables, déjà autorisées en config CSP + remotePatterns : `images.unsplash.com`).
- **Thèmes par persona** (remplacer les images génériques actuelles de `P={…}` par des visuels africains) :
  - Minimal (photographe) : mariage/évènement ouest-africain, portraits locaux, texture wax.
  - Portfolio (graphiste) : identités de marque africaines, packshots, moodboards.
  - Studio (N&B) : photos B&W de studios / portraits africains.
  - Édito (archi d'intérieur) : intérieurs africains contemporains, matières nobles.
  - Urban (street designer) : fresques/muraux ouest-africains, rue, graffiti.
  - Obsidienne (couture) : mode africaine haute couture, tissus premium.
- **Consignes** : visages africains en priorité, éviter les visuels génériques occidentaux déjà présents.
- L'utilisateur valide la sélection finale (liens) avant implémentation.

## 7. Définition of done

- [ ] Les 6 templates refondus gardent le **centrage** (blocs centrés, colonne max-w-md).
- [ ] Chaque template a une **identité visuelle distincte** (layout interne, palette, typo, composants).
- [ ] Avatars africains IA intégrés dans les fixtures demo.
- [ ] Visuels portfolio africains intégrés.
- [ ] `tsc --noEmit` propre, build OK, tous les tests passent (181).
- [ ] Les tests de rendu des templates couvrent les nouvelles structures.

## 8. Hors périmètre

- Pas de nouveau design system global (`globals.css`) — les templates restent autosuffisants (palettes/typo locales au composant), sauf ajout de fonts nécessaire.
- Pas de modification de la landing (`src/app/page.tsx`).
- Pas de correction du lint pré-existant (erreurs non liées, à traiter séparément).