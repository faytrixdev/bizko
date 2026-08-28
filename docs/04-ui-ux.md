# 04 - UI/UX Bizko

## Philosophie design
- **Conversion-first, pas joli pour être joli.** Chaque pixel doit rapprocher du tap WhatsApp.
- **Radicalement simple.** Un indépendant doit publier sans tutoriel. Pas de dashboard SaaS générique avec 12 menus.
- **Mobile-first extrême.** Design à 375px d’abord, desktop = version élargie du mobile, pas l’inverse.
- **Ultra-léger.** Pas d’animations lourdes, pas de framework UI bloaté côté profil public.

## Identité visuelle
- Nom : Bizko
- Tagline : Ton business en un lien.
- Ton : pro, chaleureux, direct, africain sans cliché (pas de motifs "ethniques" forcés).
- Logo : wordmark simple, pas d’icône complexe au MVP.

## Couleurs
- Primaire : à définir (ex: #0F172A slate-900 pour Minimal + accent vert WhatsApp #25D366 uniquement pour CTA).
- Neutres : slate 50/100/200/800/900. Pas de palette arc-en-ciel au MVP.
- Templates : chaque template a sa palette verrouillée (pas de color picker libre).
- CTA WhatsApp : toujours vert WhatsApp #25D366, texte blanc, pour reconnaissance instantanée.

## Typographie
- Headline : Inter ou Sora (moderne, lisible FR/EN)
- Body : Inter
- Hiérarchie : Nom 24-28px bold, tagline 16px medium, bio 14px regular, prix 14px semibold.
- Pas plus de 2 fontes.

## Espacements
- Unité 4px. Sections 24-32px entre blocs, 16px interne cartes.
- Profil public : max 640px largeur centrée, padding 16px mobile.

## Composants

### Profil public (écran #1, priorité absolue)
- Header : avatar 80px cercle, nom, tagline, ville + pays (icône pin), bio.
- CTA sticky : barre fixe en bas sur mobile (hauteur 64px) avec bouton principal "Discuter sur WhatsApp" (pleine largeur, 48px haut) + icône tel secondaire. Sur desktop, CTA dans header + sticky au scroll.
- Services : liste verticale, carte blanche, border slate-200, radius 12px, titre + prix à droite + bouton "WhatsApp" outline vert petit.
- Portfolio : grille 3 colonnes (mobile 2 colonnes si >6), gap 8px, radius 8px, lightbox minimal (overlay sombre, image centrée, croix).
- Sociaux : rangée d’icônes 40px, border, hover.
- Footer : texte 12px "Fait avec Bizko - Crée ton lien gratuit" (lien landing).

Performance : pas de carousel, pas de vidéo auto, images webp lazy-load.

### Dashboard / Éditeur
- Layout : sidebar gauche (desktop) / bottom nav (mobile) avec 4 entrées : Profil, Services, Portfolio, Aperçu.
- Top bar : logo, username + lien public (copier), sélecteur template, langue FR/EN, avatar menu.
- Éditeur : formulaire vertical, labels au-dessus, inputs 44px haut (touch target), sauvegarde auto "Enregistré ✓".
- Services : liste draggable simplifiée (flèches haut/bas au MVP, pas de drag lib lourde si complexité).
- Portfolio : grille upload avec zone drag & drop + prévisualisation, bouton supprimer.

### Onboarding
- Fullscreen, 3 étapes avec progress bar (1/3, 2/3, 3/3), pas de sidebar.
- Inputs larges, CTA primaire en bas fixe mobile.

### QR
- Modal centrée, QR 280px, fond blanc, padding 16px, boutons Télécharger / Partager.

## Responsive
- Mobile : 375-430px (priorité)
- Tablet : 640px max
- Desktop : 1024px, profil public reste colonne 640px centrée (pas de layout 2 colonnes).

## Accessibilité
- Contraste AA minimum, focus ring visible, tap targets 44px, alt text avatar/portfolio, sémantique h1/h2 pour SEO.

## États
- Chargement : skeleton pour profil public (avatar cercle gris, lignes), spinner pour dashboard.
- Vide : illustration simple + texte "Aucun service - Ajoute ton premier service pour convertir" + CTA.
- Erreur : inline sous input (rouge 12px), toast pour erreurs globales.
- Succès : toast vert "Lien copié !" "Profil mis à jour", check inline username dispo.
- 404 profil : "Ce Bizko n’existe pas" + CTA créer.

## Animations
- Minimales : fade 150ms pour modal/lightbox, pas de spring/bounce.
- Pas d’animation sur CTA sticky (reste fixe).

## Dashboard vs Profil public
- Dashboard : fonctionnel, dense, utilitaire (pas de marketing).
- Profil public : aéré, hiérarchie conversion, 0 distraction.

## Paramètres
- Page simple : email (read-only MVP), langue, déconnexion, suppression compte (confirm).
- Pas de settings complexes au MVP.

## Règles d’or
- Le profil public doit afficher identité + tagline + CTA WhatsApp avant tout scroll.
- Un seul CTA dominant (vert WhatsApp), tout le reste est secondaire (outline/gris).
- Jamais d’interface qui ressemble à un dashboard Notion/Linear généré par IA.
