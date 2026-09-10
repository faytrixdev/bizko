# Design : Landing Kit Bizko (pages marketing premium)

Date : 2026-09-10
Statut : validé par le membre
Portée : `src/app/comparison`, `src/app/whatsapp-conversion`, `src/app/pricing-africa`,
composants partagés `src/components/marketing/`

## Contexte

Les 3 pages marketing statiques (`/comparison`, `/whatsapp-conversion`,
`/pricing-africa`) ont un rendu daté : fond blanc brut, cartes `gray-50`, titres
`font-bold`, peu de rythme. Objectif : les rendre modernes, belles, premium, dans
le langage exact de la refonte éditoriale du blog (2026-09-09), en conservant
intégralement le contenu et le SEO.

Décisions membre :
- Architecture : kit commun partagé (pas de redesign page par page isolé).
- Contenu : conservé tel quel (textes, tarifs, structure). Design seul.
- Niveau visuel : éditorial premium léger (pur CSS, zéro JS dédié, zéro image,
  rapide en connexion lente).

## Principes

- Même design tokens que le blog : accent `#ff6b35`, primary `#111827`, border
  `#e5e7eb`, muted `#f3f4f6`, Inter, tracking-tight.
- Cartes `rounded-2xl/3xl`, `border border-border`, élévation douce au survol,
  transitions `cubic-bezier(0.16,1,0.3,1)`.
- Zéro image externe : décor en dégradés/typographie CSS.
- Zéro JS dédié : pas d'accordéon, pas de reveal au scroll → rapide en 3G (marché
  Afrique). Particularités conservées pour l'accessibilité (focus-visible global).
- SEO inchangé : `generateMetadata`, canonical, alternates conservés sur chaque
  page ; clés i18n (`comparison`, `whatsappConversion`, `pricingAfrica`) utilisées
  comme aujourd'hui avec fallback du texte par défaut.

## Kit partagé (`src/components/marketing/`)

- `MarketingMasthead` : wordmark « Bizko » (lien `/`) à gauche, lien « Créer ma
  page » (lien `/signup`) à droite, bordure basse, même esprit que le masthead du
  blog.
- `MarketingHero` : eyebrow orange (uppercase, tracking), H1 `text-4xl/5xl`
  tracking-tight, sous-titre `text-lg` grisé, ligne de CTA optionnelle (primaire
  accent + outline).
- `SectionHeader` : eyebrow + titre + description centrés.
- `FeatureCard` : icône en pastille accent (SVG inline, aucune dépendance), titre
  `text-lg` semibold, texte grisé, hover : élévation + bordure accent.
- `StatCard` : grand chiffre `text-4xl` accent + libellé grisé sur carte bordée.
- `PricingCard` : prix en grand (option moitié/mensualité), liste de fonctionnalités
  en check, CTA ; variante « Populaire » : bordure accent + léger halo.
- `FaqItem` : carte bordée, numéro mono accent, question semibold, réponse grisée
  (tout est affiché, pas d'accordéon).
- `CtaSection` : bandeau final (fond dégradé léger ou primary), titre `3xl`, 2
  actions (primaire accent + outline clair).
- `CompareTable` : conteneur `rounded-3xl border`, thead sur fond muted, cellules
  Bizko surlignées `bg-accent/5`, hover des lignes, colonnes fixes par tool.

## Mise en page par page (contenu inchangé)

### `/whatsapp-conversion`
Masthead → Hero (titre/description actuels) → 3 StatCards (Adoption massive,
Préférence pour les affaires, Taux d'ouverture élevé) → bloc 2 colonnes
« Sans Bizko » (ton rouge doux) / « Avec Bizko » (ton vert doux) → 4 étapes
numérotées (client visite → clique service → WhatsApp pré-rempli → conversation)
→ CtaSection.

### `/comparison`
Masthead → Hero → CompareTable (7 fonctionnalités × 5 colonnes existantes,
colonne Bizko mise en avant) → 5 FeatureCards (WhatsApp d'abord, Prix adapté,
Ultra-léger, Prix des services affichés, First mover Afrique francophone) →
CtaSection.

### `/pricing-africa`
Masthead → Hero → 3 PricingCards (plans existants, plan mis en avant) →
6 FeatureCards (monnaie locale, conçu pour l'Afrique, sans carte bancaire pour
démarrer, conversion, évolution, support local) → FAQ (4 FaqItem) → CtaSection.

## Hors périmètre

- Réécriture du contenu, des textes, des tarifs.
- Ajout de navigation/footer global sur ces pages.
- Interactions JS (accordéon, animations au scroll).
- Migration des pages marketing vers le pipeline MDX.
- La bannière « market-africa » (déjà convertie en article MDX draft) reste hors
  de ce kit.